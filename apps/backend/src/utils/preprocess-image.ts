import sharp from "sharp";

export async function preProcessFrontImage(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();
}


export async function preProcessRearImage(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .grayscale()

    // improve faded text contrast
    .linear(1.35, -18)

    // normalize histogram
    .normalize()

    // mild denoise
    .median(1)

    // edge enhancement
    .sharpen({
      sigma: 1.2,
      m1: 1,
      m2: 2
    })

    .png()
    .toBuffer();
}
