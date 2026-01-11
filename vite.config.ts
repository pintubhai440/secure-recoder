import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// __dirname ko ES modules mein support karne ke liye logic
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Environment variables ko current directory (.) se load karein
  // '' prefix use karne se saare variables (bina VITE_ wale bhi) load ho jayenge
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // --- GEMINI API KEYS (For Rotation & Fallback) ---
      // Gemini service 'process.env' use kar raha hai, isliye ise yahan define rehne diya hai
      'process.env.GEMINI_KEYS_POOL': JSON.stringify(env.GEMINI_KEYS_POOL || env.VITE_GEMINI_KEYS_POOL),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),

      // --- SUPABASE CONFIGURATION ---
      // Isse aap process.env.SUPABASE_URL bhi use kar payenge agar zarurat padi
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || env.VITE_SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        // '@' alias fix: path resolution sahi se set kiya gaya hai
        '@': path.resolve(__dirname, './'),
      }
    }
  };
});
