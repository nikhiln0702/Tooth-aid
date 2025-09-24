import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/analysisController.js";
import { history } from "../controllers/analysisController.js";

const router = express.Router();

// POST /analysis/upload
router.post("/upload",auth,upload.single("image"),uploadImage);
router.post("/history",auth,history)

export default router;
