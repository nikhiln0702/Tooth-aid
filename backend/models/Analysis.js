import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({

  // --- WHO ---
  // index: true makes history queries dramatically faster as data grows.
  // Without this, MongoDB scans every document to find a user's history.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // --- THE IMAGE ---
  imageUrl: {
    type: String,
    required: true
  },

  // --- AI DIAGNOSIS (from Pi) ---
  diagnosisResult: {
    type: String,
    required: true,
    default: "Pending"
  },

  // Your 3 conditions: "cavity", "plaque", "gingivitis"
  // Plus "healthy" when none are detected
  conditions: {
    type: [String],
    default: []
  },

  // Enum prevents garbage strings from Pi reaching the DB
  severity: {
    type: String,
    enum: ["healthy", "mild", "moderate", "severe", "unknown"],
    default: "unknown"
  },

  // min/max enforced at DB level — Pi can't accidentally send 1.5 or -0.3
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },

  // --- GEMINI AI TIPS ---
  // Saved permanently so history screen never needs to regenerate
  geminiTips: {
    type: [String],
    default: []
  },

  geminiDisclaimer: {
    type: String,
    default: ""
  },

  // true  = Gemini ran successfully, tips are real
  // false = Gemini failed or returned fallback — user can press "Retry"
  geminiAnalysed: {
    type: Boolean,
    default: false
  },

  // How urgently patient should see a dentist
  // Saved so history screen shows it instantly without re-calling Gemini
  urgency: {
    type: String,
    enum: ["urgent", "soon", "routine", "unknown"],
    default: "unknown"
  },

  // e.g. "₹500 - ₹3,000 for cavity filling"
  estimatedCostINR: {
    type: String,
    default: ""
  },

  // --- APPOINTMENT (Cal.com consultation feature) ---
  appointment: {
    booked: { type: Boolean, default: false },
    bookingUid: { type: String, default: null },
    doctorName: { type: String, default: null },
    scheduledAt: { type: Date, default: null },
    meetLink: { type: String, default: null }
  },

  // --- TIMESTAMP ---
  timestamp: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Analysis", analysisSchema);