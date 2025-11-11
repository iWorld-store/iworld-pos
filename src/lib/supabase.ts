import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with fallback for build time
// During build, if env vars are not set, create a placeholder client
let supabaseClient: ReturnType<typeof createClient>;

if (typeof window !== 'undefined') {
  // Client-side: use actual credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }
  supabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
} else {
  // Server-side (build time): create placeholder client
  supabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  ) as any;
}

export const supabase = supabaseClient;

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

