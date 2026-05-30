import sharp from "sharp";

export async function preProcessImage(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();
}
