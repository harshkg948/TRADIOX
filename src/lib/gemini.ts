import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeMarket = async (symbol: string, interest: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the stock market for ${symbol} considering the user's interest in ${interest}. 
    Provide a detailed risk assessment, a trading strategy, and a predicted one-week outcome.
    Format the response as JSON with the following structure:
    {
      "analysis": "string",
      "riskLevel": "Low" | "Medium" | "High",
      "riskDetails": "string",
      "strategy": "string",
      "prediction": "string",
      "confidence": number (0-100)
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
};

export const getEducationalContent = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a brief, engaging learning material about ${topic} for a first-time trader. 
    Include key concepts, tips for beginners, and a summary.
    Format the response as JSON:
    {
      "title": "string",
      "content": "string",
      "tips": ["string"],
      "summary": "string"
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
};

export const processVoiceCommand = async (command: string, portfolio: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user said: "${command}". 
    Current portfolio: ${JSON.stringify(portfolio)}.
    Interpret the user's intent (e.g., invest, check status, learn, set alert).
    If they want to invest, identify the amount and potential sector/company.
    Provide a helpful, conversational response.
    Format the response as JSON:
    {
      "intent": "string",
      "response": "string",
      "action": {
        "type": "invest" | "alert" | "info" | "none",
        "data": any
      }
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
};

export const getMarketNews = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 realistic, high-impact global trading news headlines and brief summaries for today.
    Format as JSON:
    {
      "news": [
        { "id": "string", "title": "string", "summary": "string", "impact": "Positive" | "Negative" | "Neutral", "time": "string" }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}").news;
};
