import { createClient } from '@supabase/supabase-js';

/**
 * SENTINEL AI - Supabase Connectivity Module
 * -----------------------------------------
 * Yeh module secure connection establish karta hai Supabase backend ke saath.
 * Isme humne multi-channel environment variable resolution add kiya hai
 * taaki Vite (import.meta) aur Define (process.env) dono support ho sakein.
 */

// --- 1. CONFIGURATION RESOLUTION ---

// Hum pehle Vite ke standard VITE_ prefix ko check karte hain
const VITE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback ke liye hum process.env check karte hain (jo vite.config.ts mein define kiya gaya hai)
const PROCESS_URL = typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined;
const PROCESS_KEY = typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined;

// Final constants ko resolve karna
const supabaseUrl = VITE_URL || PROCESS_URL;
const supabaseAnonKey = VITE_KEY || PROCESS_KEY;

// --- 2. SECURITY & VALIDATION LAYER ---

/**
 * Connection integrity check:
 * Agar credentials missing hain, toh Sentinel system startup par hi error trigger karega.
 */
const validateCredentials = () => {
  const missing = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    console.error(
      `%c [SENTINEL_CRITICAL]: Missing Credentials -> ${missing.join(', ')} `,
      'background: #ef4444; color: white; font-weight: bold; padding: 4px; border-radius: 2px;'
    );
    console.warn("Sentinel: Please ensure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    return false;
  }
  return true;
};

const isConfigValid = validateCredentials();

// --- 3. CLIENT INITIALIZATION ---

/**
 * Supabase Client instance export.
 * Agar config invalid hai, toh empty strings use honge crash se bachne ke liye, 
 * lekin validateCredentials() console mein error dikha dega.
 */
export const supabase = createClient(
  supabaseUrl || "https://missing-project-url.supabase.co", 
  supabaseAnonKey || "missing-anon-key"
);

/**
 * System Health Check for Database
 * Isse App.tsx mein verify kiya ja sakta hai ki connection live hai ya nahi.
 */
export const checkDatabaseConnection = async () => {
  if (!isConfigValid) return { success: false, error: "Missing configuration" };
  
  try {
    const { data, error } = await supabase.from('security_logs').select('count').limit(1);
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("[SENTINEL_DB_ERROR]: Connection failed", err.message);
    return { success: false, error: err.message };
  }
};

// Log initialization status for debugging
if (isConfigValid) {
  console.log(
    "%c [SENTINEL_SYSTEM]: Supabase Vault Link Established. ",
    "color: #22c55e; font-weight: bold;"
  );
}
