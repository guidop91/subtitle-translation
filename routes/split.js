import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { extractRawTextFromDocx } from '../utils/docxReader.js';
import { MARKER_PREFIX, MARKER_SUFFIX } from '../utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const tempDir = path.join(__dirname, '..', 'temp-uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// POST /api/split-document
// Expects:
//   - document: DOCX file
// Returns:
//   - ZIP file containing all split files
// Note: Splits by marker lines in format: === FILE: filename ===
router.post('/api/split-document', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No document uploaded' });
  }

  let tempPath = null;

  // Set headers for ZIP file download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="split-files-${Date.now()}.zip"`);

  try {
    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create zip file', message: err.message });
      }
    });

    // Pipe archive data to response
    archive.pipe(res);

    // Save uploaded file to temp
    const ext = path.extname(req.file.originalname).toLowerCase();
    tempPath = path.join(tempDir, `split-${Date.now()}${ext}`);
    fs.writeFileSync(tempPath, req.file.buffer);

    let fullText = '';

    // Extract text based on file type
    if (ext === '.docx') {
      fullText = await extractRawTextFromDocx(tempPath);
    } else if (ext === '.txt') {
      fullText = req.file.buffer.toString('utf-8');
    } else {
      archive.abort();
      if (!res.headersSent) {
        return res.status(400).json({ error: 'Unsupported file format. Please use .docx or .txt' });
      }
    }

    // Split content directly by markers instead of line by line
    // Use regex to find all markers and split content between them
    const markerPattern = new RegExp(`${MARKER_PREFIX}([\\s\\S]*?)${MARKER_SUFFIX}`, 'g');
    const parts = [];

    let lastIndex = 0;
    let match;

    while ((match = markerPattern.exec(fullText)) !== null) {
      // Content from last position to before this marker
      if (match.index > lastIndex) {
        const content = fullText.slice(lastIndex, match.index).trim();
        if (content && parts.length > 0) {
          // Add content to previous file
          parts[parts.length - 1].content += '\n' + content;
        }
      }

      // Start new file with this marker's filename
      parts.push({
        filename: match[1],
        content: ''
      });

      lastIndex = match.index + match[0].length;
    }

    // Don't forget content after the last marker
    if (lastIndex < fullText.length) {
      const remainingContent = fullText.slice(lastIndex).trim();
      if (remainingContent && parts.length > 0) {
        parts[parts.length - 1].content += '\n' + remainingContent;
      }
    }

    if (parts.length === 0) {
      archive.abort();
      if (!res.headersSent) {
        return res.status(400).json({ error: 'No files found in document. Make sure the document was created using the aggregate function.' });
      }
    }

    // Add each file to archive
    parts.forEach((part) => {
      archive.append(part.content, { name: part.filename });
    });

    // Finalize the archive (this will send the response)
    await archive.finalize();

  } catch (error) {
    console.error('Error splitting document:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to split document',
        message: error.message
      });
    }
  } finally {
    // Clean up temp file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }
  }
});

export default router;
