import sharp from 'sharp'

export async function preprocessFrontImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer()
}

export async function preprocessRearImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .grayscale()
    // Improve faded text contrast.
    .linear(1.35, -18)
    // Normalize histogram.
    .normalize()
    // Mild denoise.
    .median(1)
    // Edge enhancement.
    .sharpen({
      sigma: 1.2,
      m1: 1,
      m2: 2,
    })
    .png()
    .toBuffer()
}
