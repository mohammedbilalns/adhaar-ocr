export type Side = 'front' | 'back'

export type UploadState = {
  file: File | null
  previewUrl: string
  progress: number
  status: 'idle' | 'uploading' | 'ready'
  error: string
}

export type ExtractedRecord = {
  aadhaarNumber: string
  name: string
  dateOfBirth: string
  gender: string
  address: string
  pincode: string
  confidence: string
  sourceFiles: {
    front: string
    back: string
  }
}

export type OcrStatus = 'idle' | 'processing' | 'done'

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

export function buildMockRecord(frontFileName: string, backFileName: string): ExtractedRecord {
  return {
    aadhaarNumber: '4587 2214 9086',
    name: 'Riya Sharma',
    dateOfBirth: '14 August 1996',
    gender: 'Female',
    address: '24 Lake View Road, Indiranagar, Bengaluru, Karnataka',
    pincode: '560038',
    confidence: '98.4%',
    sourceFiles: {
      front: frontFileName,
      back: backFileName,
    },
  }
}
