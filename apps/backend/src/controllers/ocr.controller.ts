import { Request, Response } from 'express'
import { recognizeText } from '../utils/recognize-text'
import { OcrMulterRequest } from '../utils/types'
import { validateImageFiles } from '../utils/validate-files'
import { parseAdhaarTexts } from '../utils/parse-text-data'
import { asyncHandler } from '../utils/async-handler'


export const ocrController = asyncHandler( async (req : Request, res: Response) => {
  const files = (req as OcrMulterRequest).files 

  const {frontFile, backFile} = validateImageFiles(files) 

  const [frontText, backText] = await Promise.all([
    recognizeText(frontFile.buffer),
    recognizeText(backFile.buffer),
  ])

  console.log("Front data: ", frontText)
  console.log("Back data: ", backText)

  const payload = parseAdhaarTexts(frontText, backText)

  console.log("Payload: ", payload)
  res.json({
    success: true, 
    data: payload
  })

})
