import { createClient } from '@supabase/supabase-js';

// Vite environment variables ko use karna
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing! Check your .env or Vercel settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
