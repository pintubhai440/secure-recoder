import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Environment variables ko current directory (.) se load karein
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // --- GEMINI API KEYS (For Rotation & Fallback) ---
        'process.env.GEMINI_KEYS_POOL': JSON.stringify(env.GEMINI_KEYS_POOL),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        
        // --- SUPABASE CONFIGURATION ---
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      },
      resolve: {
        alias: {
          // '@' ko root directory se map karne ke liye
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
