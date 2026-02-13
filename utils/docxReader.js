import mammoth from 'mammoth';
import fs from 'fs';

/**
 * Extract raw text from a DOCX file, preserving line structure
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractRawTextFromDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // Use raw text extraction
    const result = await mammoth.extractRawText({ buffer });

    let text = result.value;

    // Mammoth adds an extra newline for each paragraph (including empty ones)
    // This causes our single blank lines to become double blank lines
    // Fix: Replace triple newlines (which were originally single blank lines)
    // with double newlines
    // Original: "1\n\n00:00:"  → After mammoth: "1\n\n\n00:00:"
    // We want to remove ONE of the extra newlines
    text = text.replace(/\n\n\n/g, '\n\n');

    return text;
  } catch (error) {
    throw new Error(`Failed to read DOCX file: ${error.message}`);
  }
}
