import { Router } from 'express'
import { upload } from '../middlewares/upload.middleware'
import { OcrController } from '../controllers/ocr.controller'
import { ImageValidationService } from '../utils/validate-files'
import { ImagePreprocessingService, OCRService } from '../services'
import { AadhaarParserService } from '../services/addhaarParsers'
const router = Router()

const imageValidationService = new ImageValidationService()
const ocrService = new OCRService()
const adhaarParserService = new AadhaarParserService()
const imagePreProcessingService = new ImagePreprocessingService()
const ocrController = new OcrController(
  imageValidationService,
  imagePreProcessingService,
  ocrService,
  adhaarParserService
)

router.post(
  '/aadhaar',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  ocrController.handleOCR
)


export { router as ocrRouter }
