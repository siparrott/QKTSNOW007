// Compatibility layer: legacy code still imports { getCurrentUser, logout } from this file.
// Supabase auth was removed; we now proxy to the new token-based auth endpoints.
// TODO: Remove these shims after updating all components to use useAuth() hook directly.

import { apiRequest } from "@/lib/queryClient";
import { clearAuthData, isTokenExpired } from "@/lib/auth-utils";

interface LegacyUser {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
  subscriptionStatus?: string;
}

export async function getCurrentUser(): Promise<LegacyUser | null> {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token || isTokenExpired()) {
      clearAuthData();
      return null;
    }
    const user = await apiRequest('/api/auth/me');
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName || user.full_name,
      created_at: user.created_at,
      subscriptionStatus: user.subscriptionStatus,
    };
  } catch (e) {
    console.warn('getCurrentUser() failed', e);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('logout() failed (continuing anyway)', e);
  } finally {
    clearAuthData();
  }
}

export function deprecatedSupabaseNotice() {
  console.warn('Supabase layer deprecated; using internal auth endpoints.');
}