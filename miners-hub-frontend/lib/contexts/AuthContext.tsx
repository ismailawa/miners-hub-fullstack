"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  refreshToken,
  removeTokens,
  getAccessToken,
  ApiError,
} from "@/lib/api/auth";
import { UserRole } from "@/lib/types";
import { ROUTES } from "@/lib/constants/routes";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Validate token and fetch user data on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Token is invalid or expired
        console.error("Token validation failed:", error);
        removeTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiLogin({ email, password });
      setUser(response.user);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRegister({ email, password, role });
      setUser(response.user);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      removeTokens();
      setIsLoading(false);
      router.push(ROUTES.HOME);
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await refreshToken();
      setUser(response.user);
    } catch (error) {
      // Refresh failed, logout user
      console.error("Token refresh failed:", error);
      setUser(null);
      removeTokens();
      router.push(ROUTES.LOGIN);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

