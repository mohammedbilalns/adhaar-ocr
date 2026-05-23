import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { getStatusLabel, uploadLabels, type Side, type UploadState } from '../lib/ocr'

type UploadCardProps = {
  side: Side
  upload: UploadState
  onFileSelect: (side: Side, file: File | null) => void
  onRemove: (side: Side) => void
  onEdit: (side: Side) => void
}

export function UploadCard({ side, upload, onFileSelect, onRemove, onEdit }: UploadCardProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleChooseClick = () => {
    inputRef.current?.click()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    onFileSelect(side, event.dataTransfer.files?.[0] ?? null)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleChooseClick()
    }
  }

  const handleRemoveClick = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onRemove(side)
  }

  return (
    <article className="upload-card">
      <div className="upload-card-header">
        <div>
          <span className="card-kicker">{uploadLabels[side]}</span>
          <h3>{side === 'front' ? 'Identity face' : 'Address face'}</h3>
        </div>
        <span className={`status-chip status-${upload.status}`}>
          {getStatusLabel(upload.status)}
        </span>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          onFileSelect(side, event.target.files?.[0] ?? null)
          event.currentTarget.value = ''
        }}
      />

      <div
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
        onClick={handleChooseClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${uploadLabels[side]} image`}
      >
        {upload.previewUrl ? (
          <img
            src={upload.previewUrl}
            alt={`${uploadLabels[side]} preview`}
            className="preview-image"
          />
        ) : (
          <div className="empty-upload">
            <div className="upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M12 16V6m0 0-4 4m4-4 4 4M5 18.5h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>Choose an image or drag it into this area</p>
            <span>JPG, PNG, or WEBP</span>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button
          type="button"
          className="card-action"
          onClick={() => onEdit(side)}
          disabled={!upload.sourceFile}
        >
          Re-edit
        </button>
        <button
          type="button"
          className="card-action"
          onClick={handleRemoveClick}
          disabled={!upload.file && !upload.error}
        >
          Remove
        </button>
      </div>

      <div className="upload-meta">
        <div className="file-row">
          <span>{upload.file?.name ?? 'No file selected'}</span>
        </div>
        {upload.file ? (
          <div className="file-row file-row-muted">
            <span>
              Rotation {upload.rotation}° | Crop {Math.round(upload.crop.width * 100)}% x{' '}
              {Math.round(upload.crop.height * 100)}%
            </span>
          </div>
        ) : null}
        {upload.error ? <p className="field-error">{upload.error}</p> : null}
      </div>
    </article>
  )
}
