import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DeepLClient } from 'deepl-node';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure output directory exists
const outputDir = path.join(__dirname, 'translated-docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp-uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve translated documents
app.use('/translated-docs', express.static(outputDir));

// Initialize DeepL translator
const translator = new DeepLClient(process.env.DEEPL_API_KEY);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'ES' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.DEEPL_API_KEY) {
      return res.status(500).json({ error: 'DeepL API key not configured' });
    }

    // Split text into chunks if it's too long (DeepL limit is 128k characters)
    const maxChunkSize = 100000;
    const chunks = [];

    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.slice(i, i + maxChunkSize));
    }

    // Translate each chunk
    const translatedChunks = await Promise.all(
      chunks.map(chunk =>
        translator.translateText(chunk, null, targetLang)
      )
    );

    // Combine translated chunks
    const translatedText = translatedChunks
      .map(result => result.text)
      .join('\n');

    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message
    });
  }
});

// Get supported languages
app.get('/api/languages', async (_req, res) => {
  try {
    if (!process.env.DEEPL_API_KEY) {
      return res.status(500).json({ error: 'DeepL API key not configured' });
    }

    const languages = await translator.getTargetLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('Languages error:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

app.post('/api/translate-document', upload.single('document'), async (req, res) => {
  if (!process.env.DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No document uploaded' });
  }

  const { targetLang = 'ES' } = req.body;

  // Save buffer to temp file first
  const tempInputPath = path.join(tempDir, `input-${Date.now()}-${req.file.originalname}`);
  fs.writeFileSync(tempInputPath, req.file.buffer);

  // Define output path
  const outputFilename = `translated-${Date.now()}-${req.file.originalname}`;
  const outputPath = path.join(outputDir, outputFilename);

  try {
    // Translate document using file path
    await translator.translateDocument(
      tempInputPath,
      outputPath,
      null,
      targetLang
    );

    // Clean up temp input file
    fs.unlinkSync(tempInputPath);

    res.json({
      message: 'El documento fue traducido muy bien.',
      outputPath: `/translated-docs/${outputFilename}`,
    });
  } catch (error) {
    console.error('Error al traducir el documento:', error);
    res.status(500).json({
      error: 'Falló la traducción del documento',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
