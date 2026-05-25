import { Request } from "express";

export type OcrFiles  = {
  front?: Express.Multer.File[];
  back?: Express.Multer.File[];
}

export interface OcrMulterRequest extends Request {
  files?: OcrFiles 
}

