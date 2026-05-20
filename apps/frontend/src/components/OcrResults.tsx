import { type ExtractedRecord, type OcrStatus, type UploadState } from '../lib/ocr'

type OcrResultsProps = {
  ocrStatus: OcrStatus
  ocrProgress: number
  extractedRecord: ExtractedRecord | null
  frontUpload: UploadState
  backUpload: UploadState
}

export function OcrResults({
  ocrStatus,
  ocrProgress,
  extractedRecord,
  frontUpload,
  backUpload,
}: OcrResultsProps) {
  if (ocrStatus === 'idle') {
    return null
  }

  return (
    <section className="results-grid reveal">
      <article className="processing-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">Process</div>
            <h2>OCR status</h2>
          </div>
          <span className={`status-chip status-${ocrStatus}`}>
            {ocrStatus === 'processing' ? 'Reading card' : 'Extraction ready'}
          </span>
        </div>

        <div className="timeline">
          <div className={`timeline-item ${frontUpload.status === 'ready' ? 'active' : ''}`}>
            Front image uploaded
          </div>
          <div className={`timeline-item ${backUpload.status === 'ready' ? 'active' : ''}`}>
            Back image uploaded
          </div>
          <div className="timeline-item active">OCR pipeline started</div>
          <div className={`timeline-item ${ocrStatus === 'done' ? 'active' : ''}`}>
            Structured fields assembled
          </div>
        </div>

        <div className="processing-meter">
          <div className="progress-row">
            <span>Overall progress</span>
            <strong>{ocrProgress}%</strong>
          </div>
          <div className="progress-track">
            <span className="progress-fill processing-fill" style={{ width: `${ocrProgress}%` }} />
          </div>
        </div>
      </article>

      <article className="record-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">Output</div>
            <h2>Extracted Aadhaar information</h2>
          </div>
        </div>

        {extractedRecord ? (
          <div className="record-grid">
            <div className="record-field">
              <span>Aadhaar number</span>
              <strong>{extractedRecord.aadhaarNumber}</strong>
            </div>
            <div className="record-field">
              <span>Full name</span>
              <strong>{extractedRecord.name}</strong>
            </div>
            <div className="record-field">
              <span>Date of birth</span>
              <strong>{extractedRecord.dateOfBirth}</strong>
            </div>
            <div className="record-field">
              <span>Gender</span>
              <strong>{extractedRecord.gender}</strong>
            </div>
            <div className="record-field record-field-wide">
              <span>Address</span>
              <strong>{extractedRecord.address}</strong>
            </div>
            <div className="record-field">
              <span>Pincode</span>
              <strong>{extractedRecord.pincode}</strong>
            </div>
            <div className="record-field">
              <span>Confidence</span>
              <strong>{extractedRecord.confidence}</strong>
            </div>
            <div className="record-field record-field-wide">
              <span>Source files</span>
              <strong>
                {extractedRecord.sourceFiles.front} / {extractedRecord.sourceFiles.back}
              </strong>
            </div>
          </div>
        ) : (
          <div className="empty-record">
            <p>Reading the uploaded card.</p>
            <span>Structured fields will appear here when OCR completes.</span>
          </div>
        )}
      </article>
    </section>
  )
}
