import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeTradeWithAI = async (
  base64Image: string | undefined,
  tradeDetails: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const modelId = 'gemini-2.5-flash'; // Using 2.5 Flash for vision capabilities

    const prompt = `
      You are a professional senior trading mentor with 20 years of experience in technical analysis. 
      Please analyze this trade based on the user's notes and the attached chart screenshot (if available).
      
      Trade Details:
      ${tradeDetails}
      
      Please provide:
      1. A critique of the market structure visible (if image provided).
      2. Validation of the entry model.
      3. Psychology check based on the outcome.
      4. Constructive feedback for improvement.
      
      Keep the response concise, bulleted, and professional.
    `;

    const parts: any[] = [{ text: prompt }];

    if (base64Image) {
      // Remove header if present (e.g., "data:image/jpeg;base64,")
      const base64Data = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity, usually safe for uploaded screenshots
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Unable to complete AI analysis at this time. Please check your API key or internet connection.";
  }
};
