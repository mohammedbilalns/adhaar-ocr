import { type ExtractedRecord, type OcrStatus, type UploadState } from '../lib/ocr'

type OcrResultsProps = {
  ocrStatus: OcrStatus
  ocrProgress: number
  extractedRecord: ExtractedRecord | null
  ocrError: string | null
  frontUpload: UploadState
  backUpload: UploadState
}

export function OcrResults({
  ocrStatus,
  extractedRecord,
  ocrError,
  ocrProgress: _ocrProgress,
  frontUpload: _frontUpload,
  backUpload: _backUpload,
}: OcrResultsProps) {
  if (ocrStatus === 'idle') {
    return null
  }

  const isLoading = ocrStatus === 'processing'

  return (
    <section className="results-grid reveal">
      <article className="record-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">Output</div>
            <h2>Extracted Aadhaar information</h2>
          </div>
        </div>

        {ocrStatus === 'error' ? (
          <div className="empty-record error-record">
            <p>{ocrError ?? 'Unable to process the uploaded images.'}</p>
            <span>The message above is returned by the backend when available.</span>
          </div>
        ) : isLoading ? (
          <div className="loading-record">
            <div className="loading-header">
              <span className="loading-pulse" aria-hidden="true" />
              <p>Reading the uploaded card.</p>
            </div>

            <div className="loading-grid" aria-hidden="true">
              <div className="loading-block">
                <span className="loading-label" />
                <span className="loading-value" />
              </div>
              <div className="loading-block">
                <span className="loading-label" />
                <span className="loading-value" />
              </div>
              <div className="loading-block">
                <span className="loading-label" />
                <span className="loading-value" />
              </div>
              <div className="loading-block">
                <span className="loading-label" />
                <span className="loading-value" />
              </div>
              <div className="loading-block loading-block-wide">
                <span className="loading-label" />
                <span className="loading-value loading-value-tall" />
              </div>
              <div className="loading-block">
                <span className="loading-label" />
                <span className="loading-value" />
              </div>
            </div>
          </div>
        ) : extractedRecord ? (
          <div className="record-grid">
            <div className="record-field">
              <span>Aadhaar number</span>
              <strong>{extractedRecord.adhaarNumber ?? 'Not found'}</strong>
            </div>
            <div className="record-field">
              <span>Full name</span>
              <strong>{extractedRecord.name ?? 'Not found'}</strong>
            </div>
            <div className="record-field">
              <span>Date of birth</span>
              <strong>{extractedRecord.dob ?? 'Not found'}</strong>
            </div>
            <div className="record-field">
              <span>Gender</span>
              <strong>{extractedRecord.gender ?? 'Not found'}</strong>
            </div>
            <div className="record-field record-field-wide">
              <span>Address</span>
              <strong>{extractedRecord.address ?? 'Not found'}</strong>
            </div>
            <div className="record-field">
              <span>Pincode</span>
              <strong>{extractedRecord.pincode ?? 'Not found'}</strong>
            </div>
          </div>
        ) : (
          <div className="empty-record">
            <p>Reading the uploaded card.</p>
          </div>
        )}
      </article>
    </section>
  )
}
