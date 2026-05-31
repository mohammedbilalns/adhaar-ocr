import { Request, Response } from 'express'
import { recognizeText } from '../utils/recognize-text'
import { OcrMulterRequest } from '../utils/types'
import { validateImageFiles } from '../utils/validate-files'
import { parseAdhaarTexts } from '../utils/parse-text-data'
import { asyncHandler } from '../utils/async-handler'
import { preProcessFrontImage,preProcessRearImage } from '../utils/preprocess-image'
import { logger } from '../utils/logger'
import { ErrorMessages, HttpStatus } from "../constants";
import { AppError } from "../utils/app-error";

export const ocrController = asyncHandler(async (req: Request, res: Response) => {
  const files = (req as OcrMulterRequest).files

  const { frontFile, backFile } = validateImageFiles(files)


  const processedImages = await Promise.all([
    preProcessFrontImage(frontFile.buffer),
    preProcessRearImage(backFile.buffer),
  ])
  const [frontData, rearData] = await Promise.all([
    recognizeText(processedImages[0]),
    recognizeText(processedImages[1]),
  ])

  logger.debug(`Front data: ${frontData.text}`)
  logger.debug(`Back data: ${rearData.text}`)
  logger.debug(`Front confidence: ${frontData.confidence}, Rear Confidence: ${rearData.confidence}`)

  const isFrontLow = frontData.confidence < 30;
  const isRearLow = rearData.confidence < 40;

  if (isFrontLow && isRearLow) {
    throw new AppError(ErrorMessages.LOW_CONFIDENCE_BOTH, HttpStatus.BAD_REQUEST);
  } else if (isFrontLow) {
    throw new AppError(ErrorMessages.LOW_CONFIDENCE_FRONT, HttpStatus.BAD_REQUEST);
  } else if (isRearLow) {
    throw new AppError(ErrorMessages.LOW_CONFIDENCE_REAR, HttpStatus.BAD_REQUEST);
  }

  const payload = parseAdhaarTexts(frontData.text, rearData.text)

  console.log("Payload: ", payload)
  res.json({
    success: true,
    data: payload
  })

})
