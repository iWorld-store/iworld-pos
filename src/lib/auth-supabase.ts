import { supabase } from './supabase';

export const authService = {
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Sign up new user (email/password)
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // No email confirmation needed
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If user was created but email not confirmed, try to sign in anyway
      // (Supabase will allow this if email confirmation is disabled)
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to sign up' };
    }
  },

  // Sign in with email/password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to sign in' };
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Simple password login (for backward compatibility - creates/uses a default account)
  async loginWithPassword(password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> {
    const DEFAULT_PASSWORD = 'iWorld007xzaidali@';
    const DEFAULT_EMAIL = 'admin@iworld.com';

    if (password !== DEFAULT_PASSWORD) {
      return { success: false, error: 'Incorrect password' };
    }

    // Try to sign in with default account
    let result = await this.signIn(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    
    if (!result.success) {
      // If account doesn't exist or email not confirmed, try to create it
      if (result.error?.includes('email') || result.error?.includes('confirm')) {
        const signUpResult = await this.signUp(DEFAULT_EMAIL, DEFAULT_PASSWORD);
        if (signUpResult.success) {
          // Wait a moment for account creation, then try signing in
          await new Promise(resolve => setTimeout(resolve, 500));
          result = await this.signIn(DEFAULT_EMAIL, DEFAULT_PASSWORD);
        } else {
          return signUpResult;
        }
      } else {
        return result;
      }
    }

    return result;
  },
};

