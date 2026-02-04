import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getDentalTips = async (imageBuffer, mimeType) => {
  // Use 'gemini-2.0-flash' for fast, multimodal responses
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash",generationConfig: { responseMimeType: "application/json" } });

  const prompt = "You are a dental health expert. Based on the image provided, Return a JSON object with  detailed dental care tips and recommendations. Be concise and informative.";

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  return JSON.parse(result.response.text());
}