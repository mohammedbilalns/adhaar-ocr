import { useEffect, useRef, useState } from 'react'
import {
  type AadhaarApiResponse,
  MAX_FILE_SIZE,
  type OcrStatus,
  initialUploadState,
  mapAadhaarResponseToRecord,
  type ExtractedRecord,
  type Side,
  type UploadState,
} from '../lib/ocr'

type UploadMap = Record<Side, UploadState>

export function useAadhaarOcr() {
  const [uploads, setUploads] = useState<UploadMap>({
    front: initialUploadState,
    back: initialUploadState,
  })
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedRecord, setExtractedRecord] = useState<ExtractedRecord | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const previewUrls = useRef<string[]>([])
  const ocrTimer = useRef<number | null>(null)

  useEffect(() => {
    const previewUrlsRef = previewUrls
    const ocrTimerRef = ocrTimer

    return () => {
      if (ocrTimerRef.current) {
        window.clearInterval(ocrTimerRef.current)
      }

      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const resetOcrState = () => {
    setExtractedRecord(null)
    setOcrStatus('idle')
    setOcrProgress(0)
    setOcrError(null)

    if (ocrTimer.current) {
      window.clearInterval(ocrTimer.current)
      ocrTimer.current = null
    }
  }

  const clearUploadResource = (previewUrl?: string) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      previewUrls.current = previewUrls.current.filter((url) => url !== previewUrl)
    }
  }

  const selectFile = (side: Side, file: File | null) => {
    if (!file) {
      return
    }

    const existingPreviewUrl = uploads[side].previewUrl
    clearUploadResource(existingPreviewUrl)

    if (file.size > MAX_FILE_SIZE) {
      resetOcrState()
      setUploads((current) => ({
        ...current,
        [side]: {
          ...initialUploadState,
          error: 'File must be 10 MB or smaller.',
        },
      }))
      return
    }

    const previewUrl = URL.createObjectURL(file)
    previewUrls.current.push(previewUrl)

    resetOcrState()
    setUploads((current) => ({
      ...current,
      [side]: {
        file,
        previewUrl,
        progress: 100,
        status: 'ready',
        error: '',
      },
    }))
  }

  const removeFile = (side: Side) => {
    const previewUrl = uploads[side].previewUrl
    clearUploadResource(previewUrl)
    resetOcrState()
    setUploads((current) => ({
      ...current,
      [side]: initialUploadState,
    }))
  }

  const canStartOcr =
    uploads.front.status === 'ready' &&
    uploads.back.status === 'ready' &&
    ocrStatus !== 'processing'

  const startOcr = () => {
    if (!canStartOcr || !uploads.front.file || !uploads.back.file) {
      return
    }

    setOcrStatus('processing')
    setOcrProgress(0)
    setExtractedRecord(null)
    setOcrError(null)

    if (ocrTimer.current) {
      window.clearInterval(ocrTimer.current)
    }

    ocrTimer.current = window.setInterval(() => {
      setOcrProgress((current) => Math.min(current + 6, 92))
    }, 180)

    void runOcrRequest({
      frontFile: uploads.front.file,
      backFile: uploads.back.file,
      onSuccess: (payload) => {
        if (ocrTimer.current) {
          window.clearInterval(ocrTimer.current)
          ocrTimer.current = null
        }

        setOcrProgress(100)
        setOcrStatus('done')
        setExtractedRecord(mapAadhaarResponseToRecord(payload))
      },
      onError: (message) => {
        if (ocrTimer.current) {
          window.clearInterval(ocrTimer.current)
          ocrTimer.current = null
        }

        setOcrProgress(0)
        setOcrStatus('error')
        setOcrError(message)
      },
    })
  }

  return {
    uploads,
    ocrStatus,
    ocrProgress,
    extractedRecord,
    ocrError,
    canStartOcr,
    selectFile,
    removeFile,
    startOcr,
  }
}

async function runOcrRequest({
  frontFile,
  backFile,
  onSuccess,
  onError,
}: {
  frontFile: File
  backFile: File
  onSuccess: (payload: AadhaarApiResponse) => void
  onError: (message: string) => void
}) {
  try {
    const formData = new FormData()
    formData.append('front', frontFile)
    formData.append('back', backFile)

    const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000'
    const response = await fetch(`${apiBaseUrl}/ocr/aadhaar`, {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as AadhaarApiResponse | { error?: string }

    if (!response.ok || isErrorPayload(payload)) {
      onError(
        isErrorPayload(payload)
          ? payload.error || 'Unable to extract text from the uploaded images.'
          : 'Unable to extract text from the uploaded images.',
      )
      return
    }

    onSuccess(payload)
  } catch {
    onError('Unable to reach the OCR service. Check that the backend is running.')
  }
}

function isErrorPayload(payload: AadhaarApiResponse | { error?: string }): payload is {
  error?: string
} {
  return 'error' in payload
}
