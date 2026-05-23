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
  address: {
    careOf: string | null
    addressLine: string | null
    postOffice: string | null
    district: string | null
    state: string | null
    pincode: string | null
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
  success: boolean
  data: {
    adhaarNumber: string | null
    name: string | null
    dob: string | null
    gender: string | null
    address: {
      careOf?: string | null
      addressLine?: string | null
      postOffice?: string | null
      district?: string | null
      state?: string | null
      pincode?: string | null
    } | null
  }
}

export function mapAadhaarResponseToRecord(payload: AadhaarApiResponse): ExtractedRecord {
  return {
    adhaarNumber: payload.data.adhaarNumber,
    name: payload.data.name,
    dob: payload.data.dob,
    gender: payload.data.gender,
    address: {
      careOf: payload.data.address?.careOf ?? null,
      addressLine: payload.data.address?.addressLine ?? null,
      postOffice: payload.data.address?.postOffice ?? null,
      district: payload.data.address?.district ?? null,
      state: payload.data.address?.state ?? null,
      pincode: payload.data.address?.pincode ?? null,
    },
  }
}
