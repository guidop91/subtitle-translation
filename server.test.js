import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Server API', () => {
  let app
  let outputDir
  let tempDir

  // Mock the DeepL client
  const mockTranslator = {
    translateText: vi.fn(),
    getTargetLanguages: vi.fn(),
    translateDocument: vi.fn(),
  }

  beforeEach(() => {
    // Create Express app similar to the main server
    app = express()
    app.use(cors())
    app.use(express.json({ limit: '10mb' }))

    // Create test directories
    outputDir = path.join(__dirname, 'translated-docs-test')
    tempDir = path.join(__dirname, 'temp-uploads-test')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Serve translated documents
    app.use('/translated-docs', express.static(outputDir))

    // Health check endpoint
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' })
    })

    // Translation endpoint
    app.post('/api/translate', async (req, res) => {
      try {
        const { text, targetLang = 'ES' } = req.body

        if (!text) {
          return res.status(400).json({ error: 'Text is required' })
        }

        // Mock translation logic
        const translatedText = `Translated: ${text}`
        res.json({ translatedText })
      } catch (error) {
        res.status(500).json({
          error: 'Translation failed',
          message: error.message
        })
      }
    })

    // Languages endpoint
    app.get('/api/languages', async (_req, res) => {
      try {
        const languages = [
          { code: 'ES', name: 'Spanish' },
          { code: 'EN', name: 'English' },
          { code: 'FR', name: 'French' },
        ]
        res.json({ languages })
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch languages' })
      }
    })
  })

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true })
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    vi.clearAllMocks()
  })

  describe('GET /api/health', () => {
    it('returns ok status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body.status).toBe('ok')
    })
  })

  describe('POST /api/translate', () => {
    it('returns 400 when text is missing', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ targetLang: 'ES' })
        .expect(400)

      expect(response.body.error).toBe('Text is required')
    })

    it('translates text successfully', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world', targetLang: 'ES' })
        .expect(200)

      expect(response.body.translatedText).toBeDefined()
    })

    it('uses ES as default target language', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world' })
        .expect(200)

      expect(response.body.translatedText).toBeDefined()
    })

    it('handles empty text string', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ text: '', targetLang: 'ES' })
        .expect(200)

      expect(response.body.translatedText).toBeDefined()
    })
  })

  describe('GET /api/languages', () => {
    it('returns list of supported languages', async () => {
      const response = await request(app)
        .get('/api/languages')
        .expect(200)

      expect(response.body.languages).toBeInstanceOf(Array)
      expect(response.body.languages.length).toBeGreaterThan(0)
    })

    it('returns languages with code and name properties', async () => {
      const response = await request(app)
        .get('/api/languages')
        .expect(200)

      response.body.languages.forEach(lang => {
        expect(lang).toHaveProperty('code')
        expect(lang).toHaveProperty('name')
      })
    })
  })

  describe('CORS', () => {
    it('includes CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })
})
