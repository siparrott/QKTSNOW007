// Legacy Supabase file - authentication now handled by PostgreSQL
// This file is kept for reference but is no longer used
// All authentication goes through /api/auth/login and /api/auth/register

export function deprecatedSupabaseNotice() {
  console.warn('Supabase authentication is deprecated. All auth now uses PostgreSQL backend.');
}