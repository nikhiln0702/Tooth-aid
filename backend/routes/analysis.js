import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/authMiddleware.js";
import {
    uploadImage,
    history,
    deleteAnalysis,
    regenerateTips
} from "../controllers/analysisController.js";
import { triggerPiCapture } from "../controllers/captureController.js";

const router = express.Router();

// POST /api/analysis/upload
// Called by the Raspberry Pi — uploads image + sends diagnosis data
router.post("/upload", auth, upload.single("image"), uploadImage);

// GET /api/analysis/history
// Called by the app — returns all analyses for the logged-in user
router.get("/history", auth, history);

// DELETE /api/analysis/:id
// Called by the app — deletes a single analysis record
router.delete("/:id", auth, deleteAnalysis);

// POST /api/analysis/capture
// Called by the app — tells the Pi to take a photo via Socket.io
router.post("/capture", auth, triggerPiCapture);

// POST /api/analysis/:id/regenerate-tips
// Called by the app — re-runs Gemini if it failed during the original upload
router.post("/:id/regenerate-tips", auth, regenerateTips);

export default router;