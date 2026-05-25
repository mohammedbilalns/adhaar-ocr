import { Request, Response } from 'express'
import { recognizeText } from '../utils/recognize-text'
import { OcrMulterRequest } from '../utils/types'
import { validateImageFiles } from '../utils/validate-files'
import { parseAdhaarTexts } from '../utils/parse-text-data'
import { asyncHandler } from '../utils/async-handler'


export const ocrController = asyncHandler( async (req : Request, res: Response) => {
  const files = (req as OcrMulterRequest).files 

  const {frontFile, backFile} = validateImageFiles(files) 

  const [frontData,rearData ] = await Promise.all([
    recognizeText(frontFile.buffer),
    recognizeText(backFile.buffer),
  ])

  console.log("Front data: ", frontData.text)
  console.log("Back data: ", rearData.text)

  console.log(`Front confidence: ${frontData.confidence}, Rear Confidence: ${rearData.confidence}`)

  const payload = parseAdhaarTexts(frontData.text, rearData.text)

  console.log("Payload: ", payload)
  res.json({
    success: true, 
    data: payload
  })

})
