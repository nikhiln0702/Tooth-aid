import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────
// CORE FUNCTION — called both from the tips route AND analysisController
// 
// Accepts either:
//   imageBuffer + mimeType  (when called with a raw uploaded file)
//   imageUrl (string)       (when called with a Cloudinary URL after upload)
//
// diagnosisContext is optional — if the Pi already detected conditions,
// we pass them in so Gemini can give more targeted advice
// ─────────────────────────────────────────────────────────────────
export const getDentalTips = async (imageBuffer, mimeType, diagnosisContext = null) => {

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const { conditions, severity, confidence } = diagnosisContext || {};
  // Build a context string if we have Pi diagnosis data
  // This makes Gemini's response much more specific and useful
  let contextBlock = "";
  if (diagnosisContext) {
    const { conditions, severity, confidence } = diagnosisContext;
    contextBlock = `
The AI model has already analysed this image and detected the following:
- Detected conditions: ${conditions && conditions.length > 0 ? conditions.join(", ") : "none"}
- Overall severity: ${severity || "unknown"}
- Model confidence: ${confidence ? Math.round(confidence * 100) + "%" : "not provided"}

Use this information to make your tips more specific to the detected conditions.
`;
  }

  const prompt = `You are a dental health advisor for an AI-powered dental screening app in India called ToothAid.

A patient has just been scanned. The AI model detected the following SPECIFIC conditions:
- Detected conditions: ${conditions && conditions.length > 0 ? conditions.join(", ") : "healthy teeth"}
- Severity: ${severity || "unknown"}
- Model confidence: ${confidence ? Math.round(confidence * 100) + "%" : "not provided"}

Your job is to give advice SPECIFIC to these exact conditions only. Do NOT give generic dental advice that applies to everyone.

Rules:
- If "cavity" is detected → focus on cavity treatment, what happens if untreated, specific foods to avoid, what a dentist will do
- If "plaque" is detected → focus on plaque removal techniques, correct brushing method, tongue cleaning, specific mouthwash recommendations
- If "gingivitis" is detected → focus on gum care, signs of worsening, specific gum massage techniques, when it becomes periodontitis
- If "healthy" → give preventive tips to MAINTAIN health, not treat any condition
- Each tip must START with the condition name it addresses e.g. "For your cavity:"
- Give cost estimates specific to the detected conditions in Indian Rupees

Return ONLY valid JSON, no markdown:
{
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "urgency": "urgent | soon | routine",
  "estimatedCostINR": "specific cost for detected conditions",
  "disclaimer": "This is AI-generated advice for informational purposes only. Please consult a qualified dental professional for proper diagnosis and treatment."
}`;

  // Build the image part for Gemini
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    console.log("Raw Gemini response:", responseText);

    // Strip any markdown wrappers Gemini occasionally adds
    let cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Extract JSON object if there's surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Gemini API Error:", error);

    // If Gemini fails, return a safe fallback rather than crashing the upload
    // The analysisController will mark geminiAnalysed: false in this case
    if (error.status === 429) {
      throw { status: 429, message: "Rate limit exceeded" };
    }

    // Return a structured fallback so the upload still succeeds
    return {
      tips: [
        "Brush your teeth twice daily using a fluoride toothpaste",
        "Floss at least once a day to remove plaque between teeth",
        "Rinse with an antibacterial mouthwash to reduce bacteria",
        "Reduce intake of sugary and acidic foods and drinks",
        "Visit a dentist for a professional cleaning and checkup"
      ],
      urgency: "soon",
      estimatedCostINR: "₹500 - ₹2,000 for a routine cleaning and checkup",
      disclaimer: "This is AI-generated advice for informational purposes only. Please consult a qualified dental professional for proper diagnosis and treatment.",
      isFallback: true  // flag so we know Gemini didn't actually run
    };
  }
};


// ─────────────────────────────────────────────────────────────────
// Helper to fetch an image from a URL and convert to buffer
// Used when analysisController calls getDentalTips with a Cloudinary URL
// ─────────────────────────────────────────────────────────────────
export const fetchImageAsBuffer = async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: response.headers.get("content-type") || "image/jpeg"
  };
};