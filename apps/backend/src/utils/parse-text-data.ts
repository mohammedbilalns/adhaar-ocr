import { ErrorMessages, HttpStatus } from "../constants";
import { AppError } from "./app-error";
import { extractAddress, extractAdhaarNumber, extractDOB, extractGender, extractGovermentText, extractName, extractPincode } from "./extract-data";
import { logger } from "./logger";

export function parseAdhaarTexts(ocrText1: string, ocrText2: string){
  if(!ocrText1.trim() || !ocrText2.trim()){
    throw new AppError(ErrorMessages.UPLOAD_CLEAR_IMAGE,HttpStatus.BAD_REQUEST)
  }

  const  frontData = parseAdhaarFront(ocrText1)
  const  rearData = parseAdhaarRear(ocrText2)

  if(frontData.adhaarNumber !== rearData.adhaarNumber){
    throw new AppError(ErrorMessages.IMAGE_MISMATCH,HttpStatus.BAD_REQUEST)
  }

  return {
    ...frontData,
    ...rearData
  }

}

function parseAdhaarFront(ocrText: string){
  const gender = extractGender(ocrText)
  const dob = extractDOB(ocrText)
  const adhaarNumber = extractAdhaarNumber(ocrText)
  const name = extractName(ocrText)


  logger.debug(`
gender: ${gender},
dob: ${dob},
adhaarNumber: ${adhaarNumber},
name: ${name}
`)

  if(!gender && !dob){
    throw new AppError(ErrorMessages.UPLOAD_CLEAR_IMAGE,HttpStatus.BAD_REQUEST)
  }

  if(!gender || !dob){
    throw new AppError(ErrorMessages.INVALID_AADHAAR_DOCUMENT,HttpStatus.BAD_REQUEST)
  }
  return {
    name,
    dob,
    gender,
    adhaarNumber,
  }
}

function parseAdhaarRear(ocrText: string){
  const govtText = extractGovermentText(ocrText)
  const adhaarNumber = extractAdhaarNumber(ocrText)
  const address =- extractAddress(ocrText)
  const pincode = extractPincode(ocrText)

  logger.debug(`
govtText: ${govtText},
adhaarNumber: ${adhaarNumber},
address: ${address},
pincode: ${pincode}
`)

  if(!govtText && !adhaarNumber){
    throw new AppError(ErrorMessages.UPLOAD_CLEAR_IMAGE,HttpStatus.BAD_REQUEST)
  }

  if(!govtText || !adhaarNumber){
    throw new AppError(ErrorMessages.INVALID_AADHAAR_DOCUMENT,HttpStatus.BAD_REQUEST)
  }
  return {
    adhaarNumber,
    address,
    pincode
  }
}
