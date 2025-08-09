import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { clearAuthData, isTokenExpired } from "@/lib/auth-utils";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const userData = await apiRequest('/api/auth/me');
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token data
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = () => {
    checkAuthStatus();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refreshUser,
  };
}