import { useEffect, useRef, useState } from 'react'
import {
  type CropBox,
  MAX_FILE_SIZE,
  type OcrStatus,
  initialUploadState,
  mapAadhaarResponseToRecord,
  type ExtractedRecord,
  type Side,
  type UploadState,
} from '../lib/ocr'
import { requestAadhaarOcr } from '../services/ocr.service'

type UploadMap = Record<Side, UploadState>
type EditorState = {
  side: Side
  sourceFile: File
  sourceUrl: string
  rotation: number
  crop: CropBox
}

export function useAadhaarOcr() {
  const [uploads, setUploads] = useState<UploadMap>({
    front: initialUploadState,
    back: initialUploadState,
  })
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedRecord, setExtractedRecord] = useState<ExtractedRecord | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const objectUrls = useRef<string[]>([])
  const ocrTimer = useRef<number | null>(null)

  useEffect(() => {
    const objectUrlsRef = objectUrls
    const ocrTimerRef = ocrTimer

    return () => {
      if (ocrTimerRef.current) {
        window.clearInterval(ocrTimerRef.current)
      }

      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
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

  const resetAll = () => {
    // Clear all object URLs
    Object.values(uploads).forEach((upload) => {
      clearUploadResource(upload.previewUrl)
      clearUploadResource(upload.sourceUrl)
    })

    if (editor) {
      clearUploadResource(editor.sourceUrl)
    }

    resetOcrState()
    setUploads({
      front: initialUploadState,
      back: initialUploadState,
    })
    setEditor(null)
  }

  const clearUploadResource = (previewUrl?: string) => {
    clearObjectUrl(previewUrl)
  }

  const selectFile = (side: Side, file: File | null) => {
    if (!file) {
      return
    }

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

    const sourceUrl = trackObjectUrl(URL.createObjectURL(file))
    setEditor({
      side,
      sourceFile: file,
      sourceUrl,
      rotation: 0,
      crop: initialUploadState.crop,
    })
  }

  const removeFile = (side: Side) => {
    const upload = uploads[side]
    clearUploadResource(upload.previewUrl)
    clearUploadResource(upload.sourceUrl)

    setEditor((current) => {
      if (current?.side === side) {
        clearUploadResource(current.sourceUrl)
        return null
      }

      return current
    })

    resetOcrState()
    setUploads((current) => ({
      ...current,
      [side]: initialUploadState,
    }))
  }

  const cancelEditing = () => {
    setEditor((current) => {
      if (!current) {
        return current
      }

      const upload = uploads[current.side]
      const isTemporarySource = upload.sourceUrl !== current.sourceUrl
      if (isTemporarySource) {
        clearUploadResource(current.sourceUrl)
      }

      return null
    })
  }

  const saveEditing = ({
    rotation,
    crop,
    file,
    previewUrl,
  }: {
    rotation: number
    crop: CropBox
    file: File
    previewUrl: string
  }) => {
    if (!editor) {
      clearUploadResource(previewUrl)
      return
    }

    const side = editor.side
    const nextPreviewUrl = trackObjectUrl(previewUrl)
    const nextSourceUrl = editor.sourceUrl

    resetOcrState()
    setUploads((current) => {
      const previous = current[side]
      const incomingSourceChanged = previous.sourceUrl && previous.sourceUrl !== nextSourceUrl
      if (previous.previewUrl) {
        clearUploadResource(previous.previewUrl)
      }
      if (incomingSourceChanged) {
        clearUploadResource(previous.sourceUrl)
      }

      return {
        ...current,
        [side]: {
          sourceFile: editor.sourceFile,
          sourceUrl: nextSourceUrl,
          file,
          previewUrl: nextPreviewUrl,
          progress: 100,
          status: 'ready',
          error: '',
          rotation,
          crop,
        },
      }
    })
    setEditor(null)
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

    void requestAadhaarOcr(uploads.front.file, uploads.back.file)
      .then((payload) => {
        if (ocrTimer.current) {
          window.clearInterval(ocrTimer.current)
          ocrTimer.current = null
        }

        setOcrProgress(100)
        setOcrStatus('done')
        setExtractedRecord(mapAadhaarResponseToRecord(payload))
      })
      .catch((error: unknown) => {
        if (ocrTimer.current) {
          window.clearInterval(ocrTimer.current)
          ocrTimer.current = null
        }

        setOcrProgress(0)
        setOcrStatus('error')
        setOcrError(
          error instanceof Error
            ? error.message
            : 'Unable to reach the OCR service. Check that the backend is running.',
        )
      })
  }

  return {
    uploads,
    editor,
    ocrStatus,
    ocrProgress,
    extractedRecord,
    ocrError,
    canStartOcr,
    selectFile,
    removeFile,
    cancelEditing,
    saveEditing,
    startOcr,
    resetAll,
  }

  function trackObjectUrl(url: string) {
    objectUrls.current.push(url)
    return url
  }

  function clearObjectUrl(url?: string) {
    if (!url) {
      return
    }

    URL.revokeObjectURL(url)
    objectUrls.current = objectUrls.current.filter((entry) => entry !== url)
  }
}
