import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parseResume } from "../services/resumeParser.js";
import { analyzeResumeAndJob } from "../services/aiService.js";

const router = express.Router();

// Setup Multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX are allowed."));
    }
  }
});

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ success: false, error: "No resume file uploaded." });
    }

    if (!jobDescription || jobDescription.trim() === "") {
      // Clean up file if validation fails
      fs.unlinkSync(resumeFile.path);
      return res.status(400).json({ success: false, error: "Job description is required." });
    }

    // 1. Extract text from the uploaded resume
    const resumeText = await parseResume(resumeFile.path, resumeFile.mimetype);

    // 2. Analyze using AI Service
    const analysisResult = await analyzeResumeAndJob(resumeText, jobDescription);

    // 3. Clean up the uploaded file
    fs.unlinkSync(resumeFile.path);

    // 4. Send response
    res.json(analysisResult);

  } catch (error) {
    console.error("Analysis Route Error:", error);
    
    // Attempt to clean up the file in case of an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || "An error occurred during analysis." 
    });
  }
});

export default router;
