import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import aggregateRouter from '../aggregate.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Aggregate Router', () => {
  let app
  let outputDir
  let tempDir

  beforeEach(() => {
    // Create Express app with the aggregate router
    app = express()
    app.use(express.json())
    app.use(aggregateRouter)

    // Create directories for testing
    outputDir = path.join(__dirname, '..', '..', 'aggregated-docs-test')
    tempDir = path.join(__dirname, '..', '..', 'temp-uploads-test')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true })
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('POST /api/aggregate-documents', () => {
    it('returns 400 when no documents are uploaded', async () => {
      const response = await request(app)
        .post('/api/aggregate-documents')
        .expect(400)

      expect(response.body.error).toBe('No documents uploaded')
    })
  })
})
