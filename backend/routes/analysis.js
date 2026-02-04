import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/authMiddleware.js";
import { uploadImage, history, deleteAnalysis } from "../controllers/analysisController.js";
import { triggerPiCapture } from "../controllers/captureController.js";

const router = express.Router();

// POST /analysis/upload
router.post("/upload",auth,upload.single("image"),uploadImage);
// GET /analysis/history
router.get("/history",auth,history)
// DELETE /analysis/:id
router.delete("/:id", auth, deleteAnalysis);

// POST /analysis/capture
router.post("/capture",auth,triggerPiCapture);

export default router;
