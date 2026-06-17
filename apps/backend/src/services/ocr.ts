import os from 'node:os'
import { createScheduler, createWorker, PSM } from 'tesseract.js'

export class OCRService {
  private _scheduler: Awaited<ReturnType<typeof createScheduler>> | null = null
  private _initPromise: Promise<void> | null = null
  private readonly _workerCount = Math.min(2, Math.max(1, os.cpus().length))

  private async ensureScheduler() {
    if (this._scheduler) {
      return this._scheduler
    }

    if (!this._initPromise) {
      this._initPromise = this.initializeScheduler()
    }

    await this._initPromise

    if (!this._scheduler) {
      throw new Error('OCR scheduler failed to initialize.')
    }

    return this._scheduler
  }

  public async warmUp() {
    await this.ensureScheduler()
  }

  private async initializeScheduler(): Promise<void> {
    const scheduler = createScheduler()

    try {
      await Promise.all(
        Array.from({ length: this._workerCount }, async () => {
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

      this._scheduler = scheduler
    } catch (error) {
      await scheduler.terminate().catch(() => undefined)
      throw error
    } finally {
      this._initPromise = null
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
    if (this._scheduler) {
      await this._scheduler.terminate()
      this._scheduler = null
    }
  }
}
