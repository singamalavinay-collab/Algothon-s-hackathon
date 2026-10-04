import { GoogleGenerativeAI } from "@google/generative-ai";
import { localMatchResumeAndJob } from "./localMatcher.js";

// ── Gemini client factory ─────────────────────────────────────
// Returns a configured client, or null if no valid key is present.
const getGenAI = () => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey === "your_key_here" || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// ── Gemini analyser ───────────────────────────────────────────
const analyzeWithGemini = async (resumeText, jobDescription) => {
  const genAI = getGenAI();
  if (!genAI) return null; // signal: unavailable

  const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are an expert technical recruiter and AI matching engine. 
    Analyze the following resume and job description.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME:
    ${resumeText}
    
    Compare the candidate's resume with the job description.
    You must respond ONLY with a valid, parseable JSON object. Do not include markdown code blocks or any other text before or after the JSON.
    
    Use this exact JSON structure:
    {
      "success": true,
      "jobTitle": "Extracted Job Title",
      "matchScore": <number 0-100>,
      "breakdown": {
        "skills": <number 0-100>,
        "experience": <number 0-100>,
        "education": <number 0-100>,
        "projects": <number 0-100>
      },
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3", "skill4"],
      "partialSkills": ["skill5"],
      "experienceAnalysis": "Brief analysis of experience match...",
      "educationAnalysis": "Brief analysis of education match...",
      "projectAnalysis": "Brief analysis of project match...",
      "explanation": "Clear explanation of why this candidate received this score. Base this strictly on the resume and job description.",
      "recommendations": [
        "Recommendation 1 (specific to missing skills or experience)",
        "Recommendation 2",
        "Recommendation 3"
      ],
      "analysisMode": "gemini",
      "candidateSkills": ["all skills found anywhere in the resume"],
      "candidateEducation": "bachelors|masters|phd|diploma|none",
      "candidateExperienceYears": 0,
      "candidateProjects": ["project name 1", "project name 2"],
      "candidateCertifications": ["certification 1"],
      "candidateRoles": ["Detected Role 1", "Detected Role 2"]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Strip markdown code fences if present
  text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

  const parsed = JSON.parse(text);
  parsed.analysisMode = "gemini";
  return parsed;
};

// ── Public API ────────────────────────────────────────────────
export const analyzeResumeAndJob = async (resumeText, jobDescription) => {
  // 1. Try Gemini first
  try {
    const geminiResult = await analyzeWithGemini(resumeText, jobDescription);
    if (geminiResult) {
      console.log("✓ Analysis completed using Gemini AI.");
      return geminiResult;
    }
    // Gemini not configured — fall through to local
    console.log("ℹ Gemini API key not configured. Using local matching engine.");
  } catch (err) {
    // Gemini call failed (bad key, quota, network) — fall back gracefully
    console.warn(`⚠ Gemini analysis failed (${err.message}). Falling back to local matching engine.`);
  }

  // 2. Fall back to local matcher
  const localResult = localMatchResumeAndJob(resumeText, jobDescription);
  console.log("✓ Analysis completed using local matching engine.");
  return localResult;
};
