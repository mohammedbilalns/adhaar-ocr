import { ErrorMessages, HttpStatus } from "../constants";
import { AppError } from "../utils/app-error";
import { extractAddress, extractAdhaarNumber, extractDOB, extractGender, extractGovermentText, extractPincode,extractName } from "./parsers";
import { logger } from "../utils/logger";

export class AadhaarParserService {
  public parseAdhaarTexts(
    ocrText1: string,
    ocrText2: string
  ) {
    if (!ocrText1.trim() || !ocrText2.trim()) {
      throw new AppError(
        ErrorMessages.UPLOAD_CLEAR_IMAGE,
        HttpStatus.BAD_REQUEST
      );
    }

    const frontData = this.parseAdhaarFront(ocrText1);
    const rearData = this.parseAdhaarRear(ocrText2);

    return {
      ...frontData,
      ...rearData,
      adhaarNumber:
      frontData.adhaarNumber || rearData.adhaarNumber,
    };
  }

  private parseAdhaarFront(ocrText: string) {
    const gender = extractGender(ocrText);
    const dob = extractDOB(ocrText);
    const adhaarNumber = extractAdhaarNumber(ocrText);
    const name = extractName(ocrText);

    logger.debug(`
gender: ${gender},
dob: ${dob},
adhaarNumber: ${adhaarNumber},
name: ${name}
`);

    if (!gender && !dob) {
      throw new AppError(
        ErrorMessages.INVALID_AADHAAR_DOCUMENT,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!gender || !dob) {
      throw new AppError(
        ErrorMessages.INVALID_AADHAAR_DOCUMENT,
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      name,
      dob,
      gender,
      adhaarNumber,
    };
  }

  private parseAdhaarRear(ocrText: string) {
    const govtText = extractGovermentText(ocrText);
    const adhaarNumber = extractAdhaarNumber(ocrText);
    const address = extractAddress(ocrText);
    const pincode = extractPincode(ocrText);

    logger.debug(`
govtText: ${govtText},
adhaarNumber: ${adhaarNumber},
address: ${address},
pincode: ${pincode}
`);

    if (!govtText && !address && !pincode) {
      throw new AppError(
        ErrorMessages.INVALID_AADHAAR_DOCUMENT,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!govtText && !address) {
      throw new AppError(
        ErrorMessages.INVALID_AADHAAR_DOCUMENT,
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      adhaarNumber,
      address,
      pincode,
    };
  }
}
