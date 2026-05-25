import { Request, Response } from 'express'
import { recognizeText } from '../utils/recognize-text'
import { OcrMulterRequest } from '../utils/types'
import { validateImageFiles } from '../utils/validate-files'
import { parseAdhaarTexts } from '../utils/parse-text-data'
import { asyncHandler } from '../utils/async-handler'
import { preProcessImage } from '../utils/preprocess-image'
import { logger } from '../utils/logger'

export const ocrController = asyncHandler( async (req : Request, res: Response) => {
  const files = (req as OcrMulterRequest).files 

  const {frontFile, backFile} = validateImageFiles(files) 


  const processedImages = await Promise.all([
    preProcessImage(frontFile.buffer),
    preProcessImage(backFile.buffer),
  ])
  const [frontData,rearData ] = await Promise.all([
    recognizeText(processedImages[0]),
    recognizeText(processedImages[1]),
  ])

  logger.debug(`Front data: ${frontData.text}`)
  logger.debug(`Back data: ${rearData.text}`)
  logger.debug(`Front confidence: ${frontData.confidence}, Rear Confidence: ${rearData.confidence}`)


  const payload = parseAdhaarTexts(frontData.text, rearData.text)

  console.log("Payload: ", payload)
  res.json({
    success: true, 
    data: payload
  })

})
