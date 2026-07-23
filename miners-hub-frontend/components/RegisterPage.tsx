import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { getUserFriendlyMessage } from "../lib/api/errors";
import BrandLogo from "./BrandLogo";

const RegisterPage: React.FC = () => {
  const { register, setPage } = useAuth();
  const { addNotification } = useNotification();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(name, email, password);
      addNotification({
        type: "info",
        title: "Welcome to Miners Hub!",
        message:
          "Your account has been created. Please complete the onboarding steps.",
      });
      // On successful registration, auth context will redirect to onboarding.
    } catch (err: unknown) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-text-secondary flex">
      {/* Left Column */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative items-center justify-center p-12"
        style={{
          backgroundImage: `url('https://picsum.photos/seed/authpage2/1200/1800')`,
        }}
      >
        <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
        <div className="relative z-10 text-center text-white">
          <button
            onClick={() => setPage("home")}
            className="flex items-center space-x-2 mx-auto mb-8"
          >
            <BrandLogo size="lg" textClassName="text-white" />
          </button>
          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            Join a Trusted Network
          </h1>
          <p className="text-lg">
            Create your place in a verified minerals network built for lawful
            trade, traceability, compliance, and investment readiness.
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setPage("home")}
              className="flex items-center space-x-2"
            >
              <BrandLogo size="sm" />
            </button>
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Create an Account
          </h2>
          <p className="text-text-secondary mb-8">
            Join the compliance-first network for verified mineral commerce.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-text-secondary mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., John Doe"
                  className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-secondary mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g., john.doe@example.com"
                  className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-secondary mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors duration-300 disabled:bg-border disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?
            <button
              onClick={() => setPage("login")}
              className="font-semibold text-accent hover:underline ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
