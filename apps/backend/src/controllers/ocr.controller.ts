import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { logger } from "../utils/logger";
import { ErrorMessages, HttpStatus } from "../constants";
import { AppError } from "../utils/app-error";
import { OcrMulterRequest } from "../utils/types";
import { ImageValidationService } from "../utils/validate-files";
import { ImagePreprocessingService } from "../services";
import { OCRService } from "../services";
import { AadhaarParserService } from "../services/addhaarParsers";

export class OcrController {
  constructor(
    private readonly imageValidationService: ImageValidationService,
    private readonly imagePreprocessingService: ImagePreprocessingService,
    private readonly ocrService: OCRService,
    private readonly aadhaarParserService: AadhaarParserService
  ) {}

  public  handleOCR = asyncHandler(
    async (req: Request, res: Response) => {
      const files = (req as OcrMulterRequest).files;

      const { frontFile, backFile } =
        this.imageValidationService.validateImageFiles(files);

      const processedImages = await Promise.all([
        this.imagePreprocessingService.preprocessFrontImage(
          frontFile.buffer
        ),
        this.imagePreprocessingService.preprocessRearImage(
          backFile.buffer
        ),
      ]);

      const [frontData, rearData] = await Promise.all([
        this.ocrService.recognizeText(processedImages[0]),
        this.ocrService.recognizeText(processedImages[1]),
      ]);

      logger.debug(`Front data: ${frontData.text}`);
      logger.debug(`Back data: ${rearData.text}`);
      logger.debug(
        `Front confidence: ${frontData.confidence}, Rear confidence: ${rearData.confidence}`
      );

      const isFrontLow = frontData.confidence < 40;
      const isRearLow = rearData.confidence < 30;

      if (isFrontLow && isRearLow) {
        throw new AppError(
          ErrorMessages.LOW_CONFIDENCE_BOTH,
          HttpStatus.BAD_REQUEST
        );
      }

      if (isFrontLow) {
        throw new AppError(
          ErrorMessages.LOW_CONFIDENCE_FRONT,
          HttpStatus.BAD_REQUEST
        );
      }

      if (isRearLow) {
        throw new AppError(
          ErrorMessages.LOW_CONFIDENCE_REAR,
          HttpStatus.BAD_REQUEST
        );
      }

      const payload =
        this.aadhaarParserService.parseAdhaarTexts(
          frontData.text,
          rearData.text
        );


      res.json({
        success: true,
        data: payload,
      });
    }
  );
}
