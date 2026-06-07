import { createWorker, PSM } from 'tesseract.js'

export class OCRService {
  private worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  private async getWorker() {
    if (!this.worker) {
      this.worker = await createWorker("eng");

      await this.worker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,-:/",
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
    }

    return this.worker;
  }

  public async recognizeText(buffer: Buffer) {
    const worker = await this.getWorker();
    const result = await worker.recognize(buffer);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
