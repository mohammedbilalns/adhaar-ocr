import { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/app-error";
import { ErrorMessages } from "../constants/error-messages";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof multer.MulterError) {
    logger.error(`[MulterError]:  ${error.message}`)
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? ErrorMessages.INVALID_FILE_SIZE
        : ErrorMessages.INVALID_UPLOAD_PAYLOAD;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error instanceof AppError) {
    logger.error(`[AppError]:  ${error.message}`)
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }


  logger.error(`[Error]:  ${error.message}`)
  return res.status(500).json({
    success: false,
    message: ErrorMessages.INTERNAL_SERVER_ERROR,
  });
};
