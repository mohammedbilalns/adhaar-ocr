import './App.css'
import { ImageEditorDialog } from './components/ImageEditorDialog'
import { OcrResults } from './components/OcrResults'
import { ThemeToggle } from './components/ThemeToggle'
import { UploadCard } from './components/UploadCard'
import { useAadhaarOcr } from './hooks/useAadhaarOcr'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()
  const {
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
  } = useAadhaarOcr()

  return (
    <main className="page-shell">
      <div className="topbar reveal">
        <div className="project-brand">
          <h1>Aadhaar OCR</h1>
          <p>Upload both sides, refine the crop, and extract structured details.</p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <section className="intro-panel reveal">
        <div className="workflow-steps" aria-label="Workflow steps">
          <span className="workflow-step is-active">1. Upload cards</span>
          <span className="workflow-step">2. Adjust image</span>
          <span className="workflow-step">3. Extract text</span>
        </div>
        <p className="intro-copy">Upload both sides, refine the crop, and extract structured details.</p>
      </section>

      <section className="workspace reveal">
        <div className="workspace-header">
          <div>
            <div className="section-kicker">Capture</div>
            <h2>Card upload</h2>
          </div>
        </div>

        <div className="upload-grid">
          <UploadCard
            side="front"
            upload={uploads.front}
            onFileSelect={selectFile}
            onRemove={removeFile}
          />
          <UploadCard
            side="back"
            upload={uploads.back}
            onFileSelect={selectFile}
            onRemove={removeFile}
          />
        </div>

        <p className="upload-note">Maximum file size: 10 MB per image.</p>

        <div className="workspace-footer">
          <button
            type="button"
            className="ocr-button"
            onClick={startOcr}
            disabled={!canStartOcr}
          >
            {ocrStatus === 'processing' ? 'Processing OCR...' : 'Extract text'}
          </button>
        </div>
      </section>

      <OcrResults
        ocrStatus={ocrStatus}
        ocrProgress={ocrProgress}
        extractedRecord={extractedRecord}
        ocrError={ocrError}
        frontUpload={uploads.front}
        backUpload={uploads.back}
      />

      {editor ? (
        <ImageEditorDialog
          isOpen={Boolean(editor)}
          side={editor.side}
          imageUrl={editor.sourceUrl}
          initialRotation={editor.rotation}
          initialCrop={editor.crop}
          onCancel={cancelEditing}
          onSave={saveEditing}
        />
      ) : null}
    </main>
  )
}

export default App
