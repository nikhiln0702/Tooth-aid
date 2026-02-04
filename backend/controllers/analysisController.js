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
      diagnosisResult: "AI Result" 
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
    res.json(history); // Return the array directly
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
}

export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the analysis and verify it belongs to the current user
    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found or unauthorized" });
    }
    
    await Analysis.findByIdAndDelete(id);
    
    res.json({ msg: "Analysis deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete analysis" });
  }
}
