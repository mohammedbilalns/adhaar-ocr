import { HttpStatus, ErrorMessages } from "../constants";
import { AppError } from "./app-error";
import { OcrFiles} from "./types";

export const validateImageFiles = (files?: OcrFiles) => {

  if (!files) {
    throw new AppError(
      ErrorMessages.BOTH_IMAGES_REQUIRED,
      HttpStatus.BAD_REQUEST
    );
  }

  const front = files.front?.[0];
  const back = files.back?.[0];

  if (!front || !back) {
    throw new AppError(
      ErrorMessages.BOTH_IMAGES_REQUIRED,
      HttpStatus.BAD_REQUEST
    );
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (!allowedMimeTypes.includes(front.mimetype)) {
    throw new AppError(
      "Front image must be JPG, JPEG, or PNG",
      HttpStatus.BAD_REQUEST
    );
  }

  if (!allowedMimeTypes.includes(back.mimetype)) {
    throw new AppError(
      "Back image must be JPG, JPEG, or PNG",
      HttpStatus.BAD_REQUEST
    );
  }

  if (front.size === 0 || back.size === 0) {
    throw new AppError(
      "Uploaded files are empty",
      HttpStatus.BAD_REQUEST
    );
  }

  return { frontFile:front, backFile: back };
};
