import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use("/api/analyze", analyzeRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running." });
});

app.listen(PORT, () => {
  const keyLoaded = process.env.AI_API_KEY && process.env.AI_API_KEY !== "your_key_here";
  console.log(`Server running on port ${PORT}`);
  console.log(`AI API Key: ${keyLoaded ? "✓ Detected" : "✗ NOT configured — set AI_API_KEY in server/.env"}`);
  console.log(`AI Model:   ${process.env.AI_MODEL || "gemini-1.5-flash (default)"}`);
});
