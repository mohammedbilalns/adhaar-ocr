import { createWorker } from "tesseract.js"

export async function recognizeText(buffer: Buffer) {
  const worker = await createWorker('eng')
  await worker.setParameters({
    'tessedit_char_whitelist':'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,-:/'
  })
  try {
    const result = await worker.recognize(buffer)
    return result.data.text
  } finally {
    await worker.terminate()
  }
}
