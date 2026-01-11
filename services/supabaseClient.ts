import { createClient } from '@supabase/supabase-js';

/**
 * SENTINEL AI - COMPLETE SUPABASE MODULE
 * -----------------------------------------
 * Yeh module secure connection establish karta hai aur videos upload karne ki suvidha deta hai.
 * Features:
 * 1. Multi-channel env resolution (Vite & process.env support)
 * 2. Automatic Credential Validation
 * 3. Database Health Check logic
 * 4. Stealth Recording Storage (Cloud Vault)
 */

// --- 1. CONFIGURATION RESOLUTION (Vite + process.env Fallback) ---

const VITE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback logic for various environments
const PROCESS_URL = typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined;
const PROCESS_KEY = typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined;

const supabaseUrl = VITE_URL || PROCESS_URL;
const supabaseAnonKey = VITE_KEY || PROCESS_KEY;

// --- 2. SECURITY & VALIDATION LAYER ---

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

export const supabase = createClient(
  supabaseUrl || "https://missing-project-url.supabase.co", 
  supabaseAnonKey || "missing-anon-key"
);

// --- 4. EXPORTED SERVICES ---

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

/**
 * SENTINEL STORAGE LOGIC (Cloud Vault)
 * ----------------------
 * Intruder ki recording ko 'recordings' bucket mein upload karta hai.
 * Note: Supabase Dashboard mein 'recordings' bucket ka PUBLIC hona zaroori hai.
 */
export const uploadVideoToVault = async (blob: Blob, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('recordings') 
      .upload(`intruders/${fileName}.webm`, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Public URL generate karna taaki dashboard mein video dikh sake
    const { data: urlData } = supabase.storage
      .from('recordings')
      .getPublicUrl(`intruders/${fileName}.webm`);

    return urlData.publicUrl;
  } catch (err) {
    console.error("%c [STORAGE_ERROR]: Upload failed ", "color: #ff4444", err);
    return null;
  }
};

// --- 5. INITIALIZATION LOG ---

if (isConfigValid) {
  console.log(
    "%c [SENTINEL_SYSTEM]: Supabase Vault Link Established. ",
    "color: #22c55e; font-weight: bold;"
  );
}
