import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");
import mammoth from "mammoth";

export const parseResume = async (filePath, mimeType) => {
  try {
    if (mimeType === "application/pdf" || filePath.toLowerCase().endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      
      // Support both pdf-parse v1 (function) and v2+ (PDFParse class)
      if (typeof pdfParseModule === "function") {
        const data = await pdfParseModule(dataBuffer);
        return data.text || "";
      } else if (pdfParseModule.PDFParse) {
        const uint8 = new Uint8Array(dataBuffer);
        const parser = new pdfParseModule.PDFParse(uint8);
        if (parser.load) await parser.load();
        const data = await parser.getText();
        return typeof data === "string" ? data : (data?.text || "");
      } else {
        throw new Error("Unable to initialize PDF parser from installed package.");
      }
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword" ||
      filePath.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }
  } catch (error) {
    console.error("Resume Parsing Error:", error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};
