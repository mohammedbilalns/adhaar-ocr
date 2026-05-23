import { Router } from 'express'
import { upload } from '../middlewares/upload.middleware'
import { ErrorMessages } from '../constants/error-messages'
import { HttpStatus } from '../constants/status-codes'
import { AppError } from '../utils/app-error'
import { recognizeText } from '../utils/recognize-text'
import { extractFrontData } from '../utils/extract-front-data'
import { extractAddress } from '../utils/extract-address'

const router = Router()

router.post(
  '/aadhaar',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as
        | {
          front?: Express.Multer.File[]
          back?: Express.Multer.File[]
        }
        | undefined

      const front = files?.front?.[0]
      const back = files?.back?.[0]

      if (!front || !back) {
        throw new AppError(ErrorMessages.BOTH_IMAGES_REQUIRED,HttpStatus.BAD_REQUEST)
      }

      const [frontText, backText] = await Promise.all([
        recognizeText(front.buffer),
        recognizeText(back.buffer),
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
  },
)


export { router as ocrRouter }
