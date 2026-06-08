import os from 'node:os'
import { createScheduler, createWorker, PSM } from 'tesseract.js'

export class OCRService {
  private scheduler: Awaited<ReturnType<typeof createScheduler>> | null = null
  private initPromise: Promise<void> | null = null
  private readonly workerCount = Math.min(2, Math.max(1, os.cpus().length))

  private async ensureScheduler() {
    if (this.scheduler) {
      return this.scheduler
    }

    if (!this.initPromise) {
      this.initPromise = this.initializeScheduler()
    }

    await this.initPromise

    if (!this.scheduler) {
      throw new Error('OCR scheduler failed to initialize.')
    }

    return this.scheduler
  }

  public async warmUp() {
    await this.ensureScheduler()
  }

  private async initializeScheduler(): Promise<void> {
    const scheduler = createScheduler()

    try {
      await Promise.all(
        Array.from({ length: this.workerCount }, async () => {
          const worker = await createWorker('eng')

          await worker.setParameters({
            tessedit_char_whitelist:
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,-:/',
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
          })

          scheduler.addWorker(worker)
        })
      )

      this.scheduler = scheduler
    } catch (error) {
      await scheduler.terminate().catch(() => undefined)
      throw error
    } finally {
      this.initPromise = null
    }
  }

  public async recognizeText(buffer: Buffer) {
    const scheduler = await this.ensureScheduler()
    const result = await scheduler.addJob('recognize', buffer)

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  }

  public async terminate() {
    if (this.scheduler) {
      await this.scheduler.terminate()
      this.scheduler = null
    }
  }
}
