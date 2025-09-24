import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  diagnosisResult: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Analysis", analysisSchema);