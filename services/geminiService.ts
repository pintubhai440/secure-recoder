import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. KEY ROTATION & POOL LOGIC
// ==========================================

const getAllKeys = (): string[] => {
  const keys: string[] = [];
  
  // Vercel/Vite se keys ka pool nikalna
  const pool = process.env.GEMINI_KEYS_POOL;
  if (pool) {
    // Comma-separated string ko array mein badalna
    keys.push(...pool.split(',').map(k => k.trim()));
  }

  // Fallback: Agar koi single key set ho
  if (process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  // Duplicate keys hatana aur khali strings saaf karna
  return Array.from(new Set(keys)).filter(k => !!k);
};

const keysPool = getAllKeys();

const getRandomKey = (): string => {
  if (keysPool.length === 0) return "MISSING_KEY";
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
      const genAI = new GoogleGenAI(apiKey);
      // Prototype ke liye 'gemini-1.5-flash' sabse fast aur reliable hai
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      return await fn(model);
    } catch (error: any) {
      lastError = error;
      // Agar Rate Limit (429) ya Server Error (503) aaye, toh retry karein
      if (error.status === 429 || error.status === 503 || error.message?.includes('429')) {
        console.warn(`Key failed or rate limited. Retrying with another key... (${i + 1}/${retries})`);
        continue;
      }
      throw error; // Baaki errors (e.g. Invalid Key) par turant stop karein
    }
  }
  throw lastError;
};

// ==========================================
// 3. EXPORTED SERVICES (Used by App.tsx)
// ==========================================

/**
 * Intruder ki photo analyze karta hai
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
 * Security Assistant ke saath chat setup karta hai
 */
export const securityChat = async (history: { role: string; text: string }[], message: string) => {
  return await callWithRetry(async (model) => {
    // Model ko security assistant ki tarah behave karne ke liye instruct karna
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
