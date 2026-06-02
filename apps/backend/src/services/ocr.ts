import { createWorker, PSM } from 'tesseract.js'

let worker: Awaited<ReturnType<typeof createWorker>> | null = null

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng')

    await worker.setParameters({
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,-:/',
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    })
  }

  return worker
}

export async function recognizeText(buffer: Buffer) {
  const workerInstance = await getWorker()
  const result = await workerInstance.recognize(buffer)

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  }
}
