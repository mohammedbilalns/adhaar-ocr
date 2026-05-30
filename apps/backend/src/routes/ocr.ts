import { Router } from 'express'
import { upload } from '../middlewares/upload.middleware'
import { ocrController } from '../controllers/ocr.controller'
const router = Router()

router.post(
  '/aadhaar',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  ocrController
)


export { router as ocrRouter }
