import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../utils/app-error";
import { ErrorMessages } from "../constants/error-messages";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
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
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};
