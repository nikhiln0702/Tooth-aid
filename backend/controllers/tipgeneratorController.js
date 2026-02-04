const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getDentalTips(imageBuffer, mimeType) {
  // Use 'gemini-2.0-flash' for fast, multimodal responses
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = "The provided image shows a dental analysis with plaque detected at 26% and 15%. Based on these visual findings and the detection boxes, provide 3-4 concise, actionable dental hygiene tips for the user.";

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}