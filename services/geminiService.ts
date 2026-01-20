
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getSmartExplanation = async (expression: string, result: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the calculation step-by-step for: ${expression} = ${result}. Keep it concise and suitable for a mobile app screen.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate explanation at this time.";
  }
};

export const solveWordProblem = async (problem: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: problem,
      config: {
        systemInstruction: "You are a mathematical genius. Solve the user's word problem. Return the final numerical result and a brief step-by-step breakdown.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: { type: Type.STRING, description: "The final numerical result of the calculation." },
            explanation: { type: Type.STRING, description: "Short step-by-step explanation." }
          },
          required: ["result", "explanation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Word Problem Error:", error);
    throw error;
  }
};
