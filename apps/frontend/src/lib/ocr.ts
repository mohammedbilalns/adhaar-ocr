export type Side = 'front' | 'back'

export type UploadState = {
  sourceFile: File | null
  sourceUrl: string
  file: File | null
  previewUrl: string
  progress: number
  status: 'idle' | 'uploading' | 'ready'
  error: string
  rotation: number
  crop: CropBox
}

export type CropBox = {
  x: number
  y: number
  width: number
  height: number
}

export type ExtractedRecord = {
  adhaarNumber: string | null
  name: string | null
  dob: string | null
  gender: string | null
  address: string | null
  pincode: string | null
}

export type OcrStatus = 'idle' | 'processing' | 'done' | 'error'

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const initialUploadState: UploadState = {
  sourceFile: null,
  sourceUrl: '',
  file: null,
  previewUrl: '',
  progress: 0,
  status: 'idle',
  error: '',
  rotation: 0,
  crop: {
    x: 0.08,
    y: 0.08,
    width: 0.84,
    height: 0.84,
  },
}

export const uploadLabels: Record<Side, string> = {
  front: 'Front side',
  back: 'Back side',
}

export type AadhaarApiResponse = {
  success: boolean
  data: {
    adhaarNumber: string | null
    name: string | null
    dob: string | null
    gender: string | null
    address: string | null
    pincode: string | null
  }
}

export type AadhaarApiError = {
  success: false
  message?: string
  error?: string
}

export function mapAadhaarResponseToRecord(payload: AadhaarApiResponse): ExtractedRecord {
  return {
    adhaarNumber: payload.data.adhaarNumber,
    name: payload.data.name,
    dob: payload.data.dob,
    gender: payload.data.gender,
    address: payload.data.address,
    pincode: payload.data.pincode,
  }
}
