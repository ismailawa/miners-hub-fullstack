'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../lib/types';
import * as authApi from '../lib/api/auth';
import * as usersApi from '../lib/api/users';
import { apiClient } from '../lib/api/client';

type PagePayload = 
  | { initialTab?: string }
  | { listing?: unknown }
  | { contractId?: string }
  | { minerId?: string }
  | Record<string, unknown>
  | null;

interface AuthContextType {
  currentUser: User | null;
  page: string;
  pagePayload: PagePayload;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  setPage: (page: string, payload?: PagePayload) => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pagePayload, setPagePayload] = useState<PagePayload>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to 'page' identifier
  const getPageFromPath = (path: string): string => {
    if (path === '/') return 'home';
    if (pathname === '/dashboard') return 'dashboard'; // special case
    const cleanPath = path.substring(1); // remove leading /
    return cleanPath || 'home';
  };

  const page = getPageFromPath(pathname || '/');

  const setPage = (newPage: string, payload: PagePayload = null) => {
    setPagePayload(payload);

    // Map 'page' identifier to URL path
    let path = '/';
    if (newPage === 'home') {
      path = '/';
    } else if (newPage === 'dashboard') {
      path = '/dashboard'; 
    } else {
      path = `/${newPage}`;
    }

    router.push(path);
  };

  // Set up API client unauthorized handler
  useEffect(() => {
    apiClient.setOnUnauthorized(async () => {
      // Clear user state when unauthorized
      setCurrentUser(null);
      router.push('/');
    });
  }, [router]);

  // Validate token and load user on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = authApi.getAccessToken();
        if (token) {
          // Token exists, validate it by fetching current user
          const user = await authApi.getCurrentUser();
          setCurrentUser(user as User);
        }
      } catch (error) {
        // Token is invalid or expired
        console.error('Token validation failed:', error);
        authApi.removeTokens();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const response = await authApi.login(email, password);
      setCurrentUser(response.user as User);

      setPage('dashboard');
    } catch (err) {
      const apiError = err as authApi.ApiError;
      const errorMessage =
        apiError.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setError(null);
      const response = await authApi.register(name, email, password);
      setCurrentUser(response.user as User);
      setPage('onboarding');
    } catch (err) {
      const apiError = err as authApi.ApiError;
      const errorMessage =
        apiError.message ||
        'Registration failed. Please check your information and try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setCurrentUser(null);
      setPage('home');
    }
  };

  const updateUser = async (user: User): Promise<void> => {
    const previousUser = currentUser;
    try {
      // First update optimistically in local state
      setCurrentUser(user);

      const profilePayload: Partial<User> = {
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        nin: user.nin,
        profileImageUrl: user.profileImageUrl,
        onboardingComplete: user.onboardingComplete,
        onboardingStep: user.onboardingStep,
        onboardingDraft: user.onboardingDraft,
        businessName: user.businessName,
        companyRegNumber: user.companyRegNumber,
        businessAddress: user.businessAddress,
        businessWebsite: user.businessWebsite,
        industry: user.industry,
        yearsInOperation: user.yearsInOperation,
        cooperativeName: user.cooperativeName,
        cooperativeRegNumber: user.cooperativeRegNumber,
        partnerType: user.partnerType,
        partnerOrganization: user.partnerOrganization,
        miningEquipment: user.miningEquipment,
        certifications: user.certifications,
        investmentPreferences: user.investmentPreferences,
        riskAppetite: user.riskAppetite,
        jurisdiction: user.jurisdiction,
        notificationSettings: user.notificationSettings,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      if (user.role === 'miner' || user.role === 'investor') {
        profilePayload.role = user.role;
      }

      // Then persist to the backend
      const updatedUser = await usersApi.updateProfile(profilePayload);
      
      // Update with the definitive server response
      setCurrentUser(updatedUser);
    } catch (error) {
      setCurrentUser(previousUser);
      throw error;
    }
  };
  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    page,
    pagePayload,
    login,
    register,
    logout,
    updateUser,
    setPage,
    isLoading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
