import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DeepLClient } from 'deepl-node';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.post('api/translate-document', async (req, res) => {
  if (!process.env.DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' });
  }

  
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
