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
  aadhaarNumber: string | null
  name: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  pincode: string | null
  rawText: {
    front: string
    back: string
  }
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

export function getStatusLabel(status: UploadState['status'] | 'processing' | 'done') {
  if (status === 'uploading') return 'Uploading'
  if (status === 'ready') return 'Ready'
  if (status === 'processing') return 'Processing'
  if (status === 'done') return 'Complete'
  return 'Waiting'
}

export type AadhaarApiResponse = {
  documentType: 'aadhaar'
  extracted: {
    aadhaarNumber: string | null
    name: string | null
    dateOfBirth: string | null
    gender: string | null
    address: string | null
    pincode: string | null
  }
  rawText: {
    front: string
    back: string
  }
}

export function mapAadhaarResponseToRecord(payload: AadhaarApiResponse): ExtractedRecord {
  return {
    aadhaarNumber: payload.extracted.aadhaarNumber,
    name: payload.extracted.name,
    dateOfBirth: payload.extracted.dateOfBirth,
    gender: payload.extracted.gender,
    address: payload.extracted.address,
    pincode: payload.extracted.pincode,
    rawText: payload.rawText,
  }
}
