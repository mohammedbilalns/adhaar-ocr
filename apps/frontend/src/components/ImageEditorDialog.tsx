import { useEffect, useRef, useState } from 'react'
import ReactCrop, {
  type Crop,
  type PercentCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import type { CropBox, Side } from '../lib/ocr'

type ImageEditorDialogProps = {
  isOpen: boolean
  side: Side
  imageUrl: string
  initialRotation: number
  initialCrop: CropBox
  onCancel: () => void
  onSave: (payload: { rotation: number; crop: CropBox; file: File; previewUrl: string }) => void
}

export function ImageEditorDialog({
  isOpen,
  side,
  imageUrl,
  initialRotation,
  initialCrop,
  onCancel,
  onSave,
}: ImageEditorDialogProps) {
  const [rotation, setRotation] = useState(initialRotation)
  const [crop, setCrop] = useState<PercentCrop>(toPercentCrop(initialCrop))
  const [displayUrl, setDisplayUrl] = useState(imageUrl)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const displayObjectUrl = useRef<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setRotation(initialRotation)
    setCrop(toPercentCrop(initialCrop))
    setSaveError('')
    setIsSaving(false)
  }, [initialCrop, initialRotation, isOpen, imageUrl])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false
    setIsPreparing(true)
    setSaveError('')

    void createRotatedPreview(imageUrl, rotation)
      .then(({ url, width, height }) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }

        if (displayObjectUrl.current) {
          URL.revokeObjectURL(displayObjectUrl.current)
        }

        displayObjectUrl.current = url
        setDisplayUrl(url)
        setDisplaySize({ width, height })
        setIsPreparing(false)
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setSaveError('Unable to prepare the image preview.')
        setIsPreparing(false)
      })

    return () => {
      cancelled = true
    }
  }, [imageUrl, isOpen, rotation])

  useEffect(() => {
    return () => {
      if (displayObjectUrl.current) {
        URL.revokeObjectURL(displayObjectUrl.current)
      }
    }
  }, [])

  if (!isOpen) {
    return null
  }

  const handleRotate = (delta: number) => {
    setRotation((current) => ((current + delta) % 360 + 360) % 360)
  }

  const handleSave = async () => {
    if (!displaySize.width || !displaySize.height) {
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      const pixelCrop = convertToPixelCrop(crop as Crop, displaySize.width, displaySize.height)
      const file = await createProcessedFile({
        imageUrl: displayUrl,
        pixelCrop,
      })
      const previewUrl = URL.createObjectURL(file)
      onSave({
        rotation,
        crop: fromPercentCrop(crop),
        file,
        previewUrl,
      })
    } catch {
      setSaveError('Unable to process the selected image. Try adjusting the crop area.')
      setIsSaving(false)
    }
  }

  return (
    <div className="editor-backdrop" role="presentation" onClick={onCancel}>
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`editor-title-${side}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-header">
          <div>
            <span className="card-kicker">{side === 'front' ? 'Front side' : 'Back side'}</span>
            <h2 id={`editor-title-${side}`}>Adjust image</h2>
          </div>
          <button type="button" className="card-action" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <div className="editor-layout">
          <div className="editor-preview-frame">
            <div className="editor-canvas">
              {isPreparing ? (
                <div className="editor-placeholder">Preparing preview...</div>
              ) : (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  keepSelection
                  minWidth={80}
                  minHeight={80}
                  ruleOfThirds
                >
                  <img src={displayUrl} alt="" className="editor-crop-image" />
                </ReactCrop>
              )}
            </div>
          </div>

          <div className="editor-controls">
            <div className="editor-group">
              <div className="editor-group-label">Rotate</div>
              <div className="editor-inline-actions">
                <button type="button" className="card-action" onClick={() => handleRotate(-90)}>
                  Rotate left
                </button>
                <button type="button" className="card-action" onClick={() => handleRotate(90)}>
                  Rotate right
                </button>
              </div>
            </div>

            <div className="editor-group">
              <div className="editor-group-label">Selection</div>
              <p className="editor-helper">Drag the rectangle to move it. Pull the corners or edges to resize.</p>
            </div>

            {saveError ? <p className="field-error">{saveError}</p> : null}

            <div className="editor-footer">
              <button
                type="button"
                className="card-action primary"
                onClick={handleSave}
                disabled={isSaving || isPreparing}
              >
                {isSaving ? 'Saving...' : 'Apply changes'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

async function createRotatedPreview(imageUrl: string, rotation: number) {
  const image = await loadImage(imageUrl)
  const { canvas, width, height } = drawRotatedImage(image, rotation)
  const blob = await canvasToBlob(canvas)

  return {
    url: URL.createObjectURL(blob),
    width,
    height,
  }
}

async function createProcessedFile({
  imageUrl,
  pixelCrop,
}: {
  imageUrl: string
  pixelCrop: Crop
}) {
  const image = await loadImage(imageUrl)
  const cropWidth = Math.max(1, Math.round(pixelCrop.width ?? image.width))
  const cropHeight = Math.max(1, Math.round(pixelCrop.height ?? image.height))
  const cropX = Math.max(0, Math.round(pixelCrop.x ?? 0))
  const cropY = Math.max(0, Math.round(pixelCrop.y ?? 0))

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = cropWidth
  outputCanvas.height = cropHeight
  const outputContext = outputCanvas.getContext('2d')

  if (!outputContext) {
    throw new Error('Canvas context unavailable')
  }

  outputContext.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  )

  const blob = await canvasToBlob(outputCanvas)
  return new File([blob], normalizeFileName(), { type: 'image/jpeg' })
}

function drawRotatedImage(image: HTMLImageElement, rotation: number) {
  const radians = (rotation * Math.PI) / 180
  const sine = Math.abs(Math.sin(radians))
  const cosine = Math.abs(Math.cos(radians))
  const width = Math.round(image.width * cosine + image.height * sine)
  const height = Math.round(image.width * sine + image.height * cosine)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context unavailable')
  }

  context.translate(width / 2, height / 2)
  context.rotate(radians)
  context.drawImage(image, -image.width / 2, -image.height / 2)

  return { canvas, width, height }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image load failed'))
    image.src = source
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to create file'))
        return
      }

      resolve(blob)
    }, 'image/jpeg', 0.92)
  })
}

function normalizeFileName() {
  return 'image 1.jpg'
}

function toPercentCrop(crop: CropBox): PercentCrop {
  return {
    unit: '%',
    x: crop.x * 100,
    y: crop.y * 100,
    width: crop.width * 100,
    height: crop.height * 100,
  }
}

function fromPercentCrop(crop: PercentCrop): CropBox {
  return {
    x: (crop.x ?? 0) / 100,
    y: (crop.y ?? 0) / 100,
    width: (crop.width ?? 100) / 100,
    height: (crop.height ?? 100) / 100,
  }
}
