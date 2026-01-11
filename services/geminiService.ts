import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. KEY ROTATION & POOL LOGIC
// ==========================================

const getAllKeys = (): string[] => {
  const keys: string[] = [];
  
  // Vite standard access aur process.env (Vercel) dono ko check karna
  // Isse key rotation feature aur bhi robust ho jata hai
  const pool = (import.meta.env?.VITE_GEMINI_KEYS_POOL) || (process.env?.GEMINI_KEYS_POOL);
  if (pool) {
    keys.push(...pool.split(',').map((k: string) => k.trim()));
  }

  // Fallback: Single key setup
  const singleKey = (import.meta.env?.VITE_GEMINI_API_KEY) || (process.env?.GEMINI_API_KEY);
  if (singleKey) {
    keys.push(singleKey);
  }

  // Duplicates hatana aur valid keys filter karna
  return Array.from(new Set(keys)).filter(k => !!k);
};

const keysPool = getAllKeys();

const getRandomKey = (): string => {
  if (keysPool.length === 0) return "";
  return keysPool[Math.floor(Math.random() * keysPool.length)];
};

// ==========================================
// 2. SAFE EXECUTION WITH RETRY
// ==========================================

const callWithRetry = async (fn: (model: any) => Promise<any>, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const apiKey = getRandomKey();
      if (!apiKey) throw new Error("SENTINEL_ERROR: No Gemini API Key found in pool.");

      // Corrected class name to GoogleGenerativeAI
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Model name kept as requested: gemini-2.5-flash-lite
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      
      return await fn(model);
    } catch (error: any) {
      lastError = error;
      
      // Rate Limit (429) ya Overloaded (503) par key switch karke retry karna
      if (error.status === 429 || error.message?.includes('429') || error.status === 503) {
        console.warn(`Sentinel Link unstable. Rotating keys... Attempt ${i + 1}/${retries}`);
        continue;
      }
      throw error; 
    }
  }
  throw lastError;
};

// ==========================================
// 3. EXPORTED SERVICES (Used by App.tsx)
// ==========================================

/**
 * Intruder ki photo analyze karta hai (Vision Analysis)
 */
export const analyzeIntrusion = async (imageB64: string) => {
  return await callWithRetry(async (model) => {
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageB64.split(',')[1],
          mimeType: 'image/jpeg'
        }
      },
      { text: "Analyze this image of an unauthorized user at a laptop. Describe the person and exactly what they appear to be doing. Be brief but highly descriptive for a security log." }
    ]);
    return result.response.text();
  });
};

/**
 * Security Assistant ke saath chat protocol
 */
export const securityChat = async (history: { role: string; text: string }[], message: string) => {
  return await callWithRetry(async (model) => {
    // History mapping for Gemini standard roles
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'ai' ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      generationConfig: {
        maxOutputTokens: 500,
      }
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  });
};
