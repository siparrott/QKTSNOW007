import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for browser operations
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
);

// Authentication functions
export async function signUpWithEmail(email: string, password: string) {
  // Try to sign up with email confirmation disabled in options
  const { data: signupData, error: signupError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      // Set email confirmation to false
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        email_confirmation: false
      }
    }
  });
  
  // Return signup result - user should be automatically logged in if email confirmation is disabled
  return { user: signupData.user, session: signupData.session, error: signupError };
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  return { error };
}