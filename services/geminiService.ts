
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
    return response.text || "I'm sorry, I couldn't retrieve the historical data at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Professor is currently busy. Please try again later.";
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
  } catch (error) {
    return [
      "Capsule Monsters was the original working title.",
      "The project almost bankrupted Game Freak multiple times.",
      "Rhydon was the first Pokémon ever designed.",
      "Mew was added at the very last second without Nintendo's knowledge.",
      "Satoshi Tajiri's childhood hobby of bug collecting inspired the game."
    ];
  }
};
