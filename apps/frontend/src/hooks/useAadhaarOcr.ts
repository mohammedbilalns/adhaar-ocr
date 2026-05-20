import { useEffect, useRef, useState } from 'react'
import {
  MAX_FILE_SIZE,
  type OcrStatus,
  buildMockRecord,
  initialUploadState,
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

    const frontFileName = uploads.front.file.name
    const backFileName = uploads.back.file.name

    setOcrStatus('processing')
    setOcrProgress(0)
    setExtractedRecord(null)

    if (ocrTimer.current) {
      window.clearInterval(ocrTimer.current)
    }

    ocrTimer.current = window.setInterval(() => {
      setOcrProgress((current) => {
        const nextProgress = Math.min(current + 7, 100)

        if (nextProgress >= 100) {
          if (ocrTimer.current) {
            window.clearInterval(ocrTimer.current)
            ocrTimer.current = null
          }

          setOcrStatus('done')
          setExtractedRecord(buildMockRecord(frontFileName, backFileName))
        }

        return nextProgress
      })
    }, 140)
  }

  return {
    uploads,
    ocrStatus,
    ocrProgress,
    extractedRecord,
    canStartOcr,
    selectFile,
    removeFile,
    startOcr,
  }
}
