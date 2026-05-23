import { Router } from 'express'
import multer from 'multer'
import type { NextFunction, Request, Response } from 'express'
import { createWorker } from 'tesseract.js'
import {
  buildAadhaarResponse,
  getInvalidDocumentMessage,
  normalizeOcrText,
} from '../utils/aadhaar'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are supported.'))
      return
    }

    callback(null, true)
  },
})

router.post(
  '/aadhaar',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as
        | {
            front?: Express.Multer.File[]
            back?: Express.Multer.File[]
          }
        | undefined

      const front = files?.front?.[0]
      const back = files?.back?.[0]

      if (!front || !back) {
        res.status(400).json({
          error: 'Both front and back Aadhaar images are required.',
        })
        return
      }

      const [frontText, backText] = await Promise.all([
        recognizeText(front.buffer),
        recognizeText(back.buffer),
      ])

      const payload = buildAadhaarResponse(frontText, backText)
      res.json(payload)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to process the uploaded images.'

      const statusCode =
        message === getInvalidDocumentMessage()
          ? 422
          : message.includes('Only image uploads') || message.includes('required')
            ? 400
            : 500

      res.status(statusCode).json({
        error: message,
      })
    }
  },
)

async function recognizeText(buffer: Buffer) {
  const worker = await createWorker('eng')

  try {
    const result = await worker.recognize(buffer)
    return normalizeOcrText(result.data.text)
  } finally {
    await worker.terminate()
  }
}

router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 10 MB or smaller.'
        : 'Invalid upload payload.'

    res.status(400).json({ error: message })
    return
  }

  if (error instanceof Error) {
    res.status(400).json({ error: error.message })
    return
  }

  next(error)
})

export { router as ocrRouter }
