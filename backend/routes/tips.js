import express from 'express';
import multer from 'multer';
import { getDentalTips } from '../controllers/tipgeneratorController.js'; // Note the .js extension is required in ESM

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('dental_image'), async (req, res) => {
  try {
    const { detectionSummary } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const results = await getDentalTips(
      req.file.buffer, 
      req.file.mimetype, 
      detectionSummary
    );

    res.status(200).json(results);

  } catch (error) {
    console.error("Analysis Error:", error);

    // Handles the 15 RPM limit for the Gemini Free Tier
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait a minute." });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;