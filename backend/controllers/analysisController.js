import Analysis from "../models/Analysis.js";
import { getDentalTips, fetchImageAsBuffer } from "./tipgeneratorController.js";
import { getIo } from "../config/socket.js";

// ─────────────────────────────────────────────────────────────────
// POST /api/analysis/upload
// Called by the Raspberry Pi after it captures and processes an image.
//
// Pi sends as multipart/form-data:
//   req.file                  → image (Multer → Cloudinary)
//   req.body.diagnosisResult  → e.g. "Cavity detected (High Confidence)"
//   req.body.conditions       → JSON string e.g. '["cavity","plaque"]'
//   req.body.severity         → "mild" | "moderate" | "severe" | "healthy"
//   req.body.confidence       → number string e.g. "0.87"
// ─────────────────────────────────────────────────────────────────
export const uploadImage = async (req, res) => {
  try {
    // Step 1 — Cloudinary URL from Multer
    const imageUrl = req.file.path;
    console.log("Image uploaded to Cloudinary:", imageUrl);

    // Step 2 — Parse Pi diagnosis data
    const diagnosisResult = req.body.diagnosisResult || "Analysis complete";
    const severity = req.body.severity || "unknown";
    const confidence = req.body.confidence
      ? parseFloat(req.body.confidence)
      : null;

    // conditions arrives as a JSON string because multipart/form-data
    // can't send arrays directly — Pi sends '["cavity","plaque"]'
    let conditions = [];
    try {
      conditions = req.body.conditions
        ? JSON.parse(req.body.conditions)
        : [];
    } catch {
      conditions = req.body.conditions
        ? req.body.conditions.split(",").map(c => c.trim())
        : [];
    }

    console.log("Diagnosis from Pi:", { diagnosisResult, conditions, severity, confidence });

    // Step 3 — Call Gemini automatically after every upload
    // Wrapped in its own try/catch — Gemini failure must NOT stop the upload
    let geminiTips = [];
    let geminiDisclaimer = "";
    let geminiAnalysed = false;
    let urgency = "unknown";
    let estimatedCostINR = "";

    try {
      const { buffer, mimeType } = await fetchImageAsBuffer(imageUrl);

      const geminiResult = await getDentalTips(buffer, mimeType, {
        conditions,
        severity,
        confidence
      });

      geminiTips = geminiResult.tips || [];
      geminiDisclaimer = geminiResult.disclaimer || "";
      urgency = geminiResult.urgency || "unknown";
      estimatedCostINR = geminiResult.estimatedCostINR || "";
      geminiAnalysed = !geminiResult.isFallback;

      console.log("Gemini complete. Analysed:", geminiAnalysed);

    } catch (geminiError) {
      console.error("Gemini failed during upload (non-fatal):", geminiError.message);
    }

    // Step 4 — Save everything to MongoDB
    const analysis = new Analysis({
      userId: req.user.id,
      imageUrl,
      diagnosisResult,
      conditions,
      severity,
      confidence,
      geminiTips,
      geminiDisclaimer,
      geminiAnalysed,
      urgency,
      estimatedCostINR
    });

    await analysis.save();
    console.log("Analysis saved:", analysis._id);

    // Step 5 — Emit ANALYSIS_COMPLETE to the phone via Socket.io
    // The phone is listening for this event in home.jsx
    // When it receives it, it navigates to the result screen automatically
    const io = getIo();
    if (io) {
      // We emit to ALL connected clients for now
      // In a multi-user production app you'd target by userId
      // but for your demo this is fine since one user is active at a time
      io.emit("ANALYSIS_COMPLETE", {
        analysisId: analysis._id,
        imageUrl: analysis.imageUrl,
        diagnosisResult: analysis.diagnosisResult,
        conditions: analysis.conditions,
        severity: analysis.severity,
        confidence: analysis.confidence,
        geminiTips: analysis.geminiTips,
        geminiDisclaimer: analysis.geminiDisclaimer,
        geminiAnalysed: analysis.geminiAnalysed,
        urgency: analysis.urgency,
        estimatedCostINR: analysis.estimatedCostINR
      });
      console.log("ANALYSIS_COMPLETE emitted to client.");
    } else {
      console.warn("Socket.io not available — could not emit ANALYSIS_COMPLETE.");
    }

    // Step 6 — Return response to Pi
    res.json({
      msg: "Image uploaded and analysed successfully",
      analysisId: analysis._id,
      imageUrl: analysis.imageUrl,
      diagnosisResult: analysis.diagnosisResult,
      conditions: analysis.conditions,
      severity: analysis.severity,
      confidence: analysis.confidence,
      geminiTips: analysis.geminiTips,
      geminiDisclaimer: analysis.geminiDisclaimer,
      geminiAnalysed: analysis.geminiAnalysed,
      urgency: analysis.urgency,
      estimatedCostINR: analysis.estimatedCostINR
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ─────────────────────────────────────────────────────────────────
// GET /api/analysis/history
// ─────────────────────────────────────────────────────────────────
export const history = async (req, res) => {
  try {
    const userHistory = await Analysis
      .find({ userId: req.user.id })
      .sort({ timestamp: -1 });

    res.json(userHistory);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};


// ─────────────────────────────────────────────────────────────────
// DELETE /api/analysis/:id
// ─────────────────────────────────────────────────────────────────
export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found or unauthorized" });
    }

    await Analysis.findByIdAndDelete(id);
    res.json({ msg: "Analysis deleted successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete analysis" });
  }
};


// ─────────────────────────────────────────────────────────────────
// POST /api/analysis/:id/regenerate-tips
// Called when geminiAnalysed is false — lets user retry Gemini
// ─────────────────────────────────────────────────────────────────
export const regenerateTips = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found or unauthorized" });
    }

    const { buffer, mimeType } = await fetchImageAsBuffer(analysis.imageUrl);
    const geminiResult = await getDentalTips(buffer, mimeType, {
      conditions: analysis.conditions,
      severity: analysis.severity,
      confidence: analysis.confidence
    });

    analysis.geminiTips = geminiResult.tips || [];
    analysis.geminiDisclaimer = geminiResult.disclaimer || "";
    analysis.urgency = geminiResult.urgency || "unknown";
    analysis.estimatedCostINR = geminiResult.estimatedCostINR || "";
    analysis.geminiAnalysed = !geminiResult.isFallback;
    await analysis.save();

    res.json({
      msg: "Tips regenerated successfully",
      geminiTips: analysis.geminiTips,
      geminiDisclaimer: analysis.geminiDisclaimer,
      geminiAnalysed: analysis.geminiAnalysed,
      urgency: analysis.urgency,
      estimatedCostINR: analysis.estimatedCostINR
    });

  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a minute and try again."
      });
    }
    res.status(500).json({ error: err.message });
  }
};