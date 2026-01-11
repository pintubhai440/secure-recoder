
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeIntrusion = async (imageB64: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: imageB64.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Analyze this image of an unauthorized user at a laptop. Describe the person and exactly what they appear to be doing. Be brief but highly descriptive for a security log." }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 1024 }
    }
  });
  return response.text;
};

export const securityChat = async (history: { role: string; text: string }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are the Sentinel AI Security Assistant. You help the user manage their laptop security. You can interpret logs, explain security breaches, and suggest safety measures. Keep responses concise and professional."
    }
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};
