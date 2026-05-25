import { createWorker} from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker("eng");

    // await worker.setParameters({
    //   tessedit_char_whitelist:
    //     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.-:/()",
    //   //tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    //  // preserve_interword_spaces: "1",
    // });
  }

  return worker;
}

export async function recognizeText(buffer: Buffer) {
  const worker = await getWorker();

  const result = await worker.recognize(buffer);

  return {
    text : result.data.text,
    confidence : result.data.confidence,
  }
}
