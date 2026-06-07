import { HttpStatus, ErrorMessages } from "../constants";
import { AppError } from "./app-error";
import { OcrFiles} from "./types";

export class ImageValidationService {
  private readonly allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  public validateImageFiles(files?: OcrFiles) {
    if (!files) {
      throw new AppError(
        ErrorMessages.BOTH_IMAGES_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    const frontFile = files.front?.[0];
    const backFile = files.back?.[0];

    if (!frontFile || !backFile) {
      throw new AppError(
        ErrorMessages.BOTH_IMAGES_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!this.allowedMimeTypes.includes(frontFile.mimetype)) {
      throw new AppError(
        ErrorMessages.INVALID_FRONT_IMAGE_TYPE,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!this.allowedMimeTypes.includes(backFile.mimetype)) {
      throw new AppError(
        ErrorMessages.INVALID_REAR_IMAGE_TYPE,
        HttpStatus.BAD_REQUEST
      );
    }

    if (frontFile.size === 0 || backFile.size === 0) {
      throw new AppError(
        ErrorMessages.FILES_CANNOT_BE_EMPTY,
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      frontFile,
      backFile,
    };
  }
}
