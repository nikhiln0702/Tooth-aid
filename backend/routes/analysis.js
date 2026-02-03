import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/analysisController.js";
import { history } from "../controllers/analysisController.js";
import { triggerPiCapture } from "../controllers/captureController.js";

const router = express.Router();

// POST /analysis/upload
router.post("/upload",auth,upload.single("image"),uploadImage);
// GET /analysis/history
router.get("/history",auth,history)

// POST /analysis/capture
router.post("/capture",auth,triggerPiCapture);

export default router;
