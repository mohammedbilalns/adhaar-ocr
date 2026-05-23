export type Side = 'front' | 'back'

export type UploadState = {
  file: File | null
  previewUrl: string
  progress: number
  status: 'idle' | 'uploading' | 'ready'
  error: string
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
  file: null,
  previewUrl: '',
  progress: 0,
  status: 'idle',
  error: '',
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
