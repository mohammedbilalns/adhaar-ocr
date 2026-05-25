import { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/app-error";
import { ErrorMessages } from "../constants/error-messages";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof multer.MulterError) {
    console.log("MulterError", error)
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
    console.log("AppError", error)
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }


  console.log("Error", error)
  return res.status(500).json({
    success: false,
    message: ErrorMessages.INTERNAL_SERVER_ERROR,
  });
};
