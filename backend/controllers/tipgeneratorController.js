import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getDentalTips = async (imageBuffer, mimeType) => {
  // Use 'gemini-2.5-flash' for multimodal responses
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a dental health expert in India. Analyze the provided dental/oral image and provide helpful tips.

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "disclaimer": "This is AI-generated advice. Please consult a dental professional for proper diagnosis and treatment."
}

Provide 4-6 specific, actionable dental care tips based on what you observe in the image.Also provide some future probable treatments and some cost estimates.  Be concise and helpful.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("Raw Gemini response:", responseText);
    
    // Clean up the response in case it has markdown code blocks
    let cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Cleaned response was:", cleanedResponse);
    //   // Return a fallback response if parsing fails
    //   return {
    //     tips: [
    //       "Brush your teeth twice daily for at least 2 minutes",
    //       "Floss daily to remove plaque between teeth",
    //       "Visit your dentist regularly for check-ups",
    //       "Limit sugary foods and drinks",
    //       "Use fluoride toothpaste for stronger enamel"
    //     ],
    //     disclaimer: "This is AI-generated advice. Please consult a dental professional for proper diagnosis and treatment."
    //   };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}