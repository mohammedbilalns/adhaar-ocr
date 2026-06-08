import sharp from 'sharp'

export class ImagePreprocessingService {
  private readonly maxDimension = 1800

  private preprocessFront(buffer: Buffer) {
    return sharp(buffer)
      .rotate() // auto rotates image based on EXIF orientation metadata 
      .resize({
        width: this.maxDimension,
        height: this.maxDimension,
        fit: 'inside', // keeps the whole image visible 
        withoutEnlargement: true, // avoids upscaling small images
      }) // scales the image down so that side doesnt exceeds max dimension 
      .grayscale() // convert to b/w
      .normalize() // imporve contrast 
      .sharpen() // enhance edges  
      .png({
        compressionLevel: 3,
        adaptiveFiltering: false,
      })
      .toBuffer()
  }

  public async preprocessFrontImage(
    buffer: Buffer
  ): Promise<Buffer> {
    return this.preprocessFront(buffer)
  }

  public async preprocessRearImage(
    buffer: Buffer
  ): Promise<Buffer> {
    return sharp(buffer)
      .rotate()
      .resize({
        width: this.maxDimension,
        height: this.maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .grayscale()
      .linear(1.35, -18) // adjust brightness and contrast using a linear transform  
      .normalize()
      .median(1) // apply median filter
      // Edge enhancement.
      .sharpen({
        sigma: 1.2,
        m1: 1,
        m2: 2,
      })
      .png({
        compressionLevel: 3,
        adaptiveFiltering: false,
      })
      .toBuffer()
  }
}
