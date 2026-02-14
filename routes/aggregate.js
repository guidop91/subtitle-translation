import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Paragraph, HeadingLevel, Packer } from 'docx';
import { generateMarker } from '../utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const outputDir = path.join(__dirname, '..', 'aggregated-docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const tempDir = path.join(__dirname, '..', 'temp-uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to get file extension
function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Helper function to get filename without extension
function getFilenameWithoutExt(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
}

// Helper to read file content based on type
function readFileContent(file) {
  const ext = getFileExtension(file.originalname);
  const content = file.buffer.toString('utf-8');

  // Different parsing based on file type could be added here
  // For now, we'll treat all as plain text/subtitle formats
  return {
    name: file.originalname,  // Keep full filename including extension
    content: content,
    extension: ext
  };
}

router.post('/api/aggregate-documents', upload.array('documents', 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No documents uploaded' });
  }

  try {
    const files = req.files;
    const fileData = files.map(readFileContent);

    // Create DOCX document
    const docChildren = [];

    // Add each file's content
    fileData.forEach((file, index) => {
      // File separator/heading using marker format
      docChildren.push(
        new Paragraph({
          text: generateMarker(file.name),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          border: {
            bottom: {
              color: 'auto',
              space: 1,
              value: 'single',
              size: 6,
            }
          }
        })
      );

      // Add file content as paragraphs - preserve exact line structure
      const lines = file.content.split('\n');
      lines.forEach((line, lineIndex) => {
        // Skip empty lines - they'll be preserved by the fact that
        // consecutive content paragraphs are separated
        if (line === '' && lineIndex > 0 && lines[lineIndex - 1] === '') {
          // Skip consecutive empty lines (DOCX/mammoth adds extra)
          return;
        }

        // Create paragraph for each non-empty line
        if (line !== '' || lineIndex === 0 || lines[lineIndex - 1] !== '') {
          docChildren.push(
            new Paragraph({
              text: line,
              spacing: { after: 0 }
            })
          );
        } else {
          // Add a single empty paragraph for intentional blank lines
          docChildren.push(
            new Paragraph({
              text: '',
              spacing: { after: 0 }
            })
          );
        }
      });

      // Add minimal spacing between files
      if (index < fileData.length - 1) {
        docChildren.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 }
          })
        );
      }
    });

    // Create the document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren
      }]
    });

    // Save to file
    const timestamp = Date.now();
    const outputFilename = `aggregated-${timestamp}.docx`;
    const outputPath = path.join(outputDir, outputFilename);

    // Import the Packer dynamically
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    // Send file for download
    res.download(outputPath, outputFilename, (err) => {
      // Clean up file after sending
      if (!err) {
        fs.unlinkSync(outputPath);
      }
    });

  } catch (error) {
    console.error('Error aggregating documents:', error);
    res.status(500).json({
      error: 'Failed to aggregate documents',
      message: error.message
    });
  }
});

export default router;
