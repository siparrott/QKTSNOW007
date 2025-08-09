import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isTokenExpired, clearAuthData } from "@/lib/auth-utils";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      // If no token exists, redirect to login
      if (!token) {
        setIsAuthenticated(false);
        setLocation('/login');
        return;
      }

      // Check if token is expired based on stored expiration date
      if (isTokenExpired()) {
        clearAuthData();
        setIsAuthenticated(false);
        setLocation('/login');
        return;
      }

      try {
        // Verify token with server
        await apiRequest('/api/auth/me');
        setIsAuthenticated(true);
      } catch (error) {
        // If server verification fails, clear all auth data
        clearAuthData();
        setIsAuthenticated(false);
        setLocation('/login');
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return <>{children}</>;
}