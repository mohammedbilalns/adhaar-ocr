import { ErrorMessages } from '../constants/error-messages'
import { Request, Response } from 'express'
import { HttpStatus } from '../constants/status-codes'
import { AppError } from '../utils/app-error'
import { recognizeText } from '../utils/recognize-text'
import { extractFrontData } from '../utils/extract-front-data'
import { extractAddress } from '../utils/extract-address'
import { OcrMulterRequest } from '../utils/types'
import { validateImageFiles } from '../utils/validate-files'


export const ocrController = async (req : Request, res: Response) => {
  try {
    const files = (req as OcrMulterRequest).files 

    const {frontFile, backFile} = validateImageFiles(files) 

    const [frontText, backText] = await Promise.all([
      recognizeText(frontFile.buffer),
      recognizeText(backFile.buffer),
    ])
    const frontData = extractFrontData(frontText)
    const address = extractAddress(backText)

    console.log("Front data: ", frontText)
    console.log("Back data: ", backText)

    const payload = {
      name: frontData.name,
      dob: frontData.dob,
      gender: frontData.gender,
      adhaarNumber: frontData.aadhaarNumber,
      address
    }
    console.log("Payload: ", payload)
    res.json({
      success: true, 
      data: payload
    })
  } catch (error) {
    console.log( "Something went wrong", error)
    throw new AppError(ErrorMessages.INTERNAL_SERVER_ERROR,HttpStatus.INTERNAL_SERVER_ERROR) 
  }
}

