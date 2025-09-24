import Analysis from "../models/Analysis.js";

export const uploadImage = async (req, res) => {
  try {
    // Cloudinary gives req.file.path (secure URL)
    const imageUrl = req.file.path;
    console.log("Image uploaded to Cloudinary:", imageUrl);

    // Store analysis record with dummy result for now
    const analysis = new Analysis({
      userId: req.user.id,   // comes from JWT middleware
      imageUrl,
      diagnosisResult: "Pending AI Result" // later replaced by model output
    });

    await analysis.save();

    res.json({
      msg: "Image uploaded successfully",
      imageUrl: analysis.imageUrl,
      diagnosisResult: analysis.diagnosisResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const history = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
}
