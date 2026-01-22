
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHistoricalInsight = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed, historical, and encyclopedic insight about the following Pokémon topic: "${query}". 
      Focus on cultural impact, development history, and legacy. Do not use images. Use professional, scholarly tone.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Archive entry corrupted.";
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return "QUOTA_REACHED: System overload. Viewing cached local data.";
    }
    console.error("Gemini API Error:", error);
    return "The Professor is currently offline.";
  }
};

export const getQuickStats = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "List 5 obscure but fascinating historical facts about the development of the original Pokémon Red and Green games. Return as a JSON array of strings.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text.trim()) as string[];
  } catch (error: any) {
    return [
      "Rhydon was the very first Pokémon index created.",
      "The game was developed by only 9 core people.",
      "Capsule Monsters was the original project name.",
      "Mew's inclusion was an unauthorized late addition.",
      "Satoshi Tajiri's bug collecting hobby inspired the entire concept."
    ];
  }
};
