import { createWorker } from "tesseract.js"

export async function recognizeText(buffer: Buffer) {
  const worker = await createWorker('eng')
  try {
    const result = await worker.recognize(buffer)
    return result.data.text
  } finally {
    await worker.terminate()
  }
}
