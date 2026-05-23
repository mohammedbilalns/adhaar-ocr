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
    openEditor,
    cancelEditing,
    saveEditing,
    startOcr,
  } = useAadhaarOcr()

  return (
    <main className="page-shell">
      <div className="topbar reveal">
        <div className="eyebrow">Aadhaar OCR workspace</div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <section className="intro-panel reveal">
        <h1>Upload both sides and extract the record.</h1>
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
            onEdit={openEditor}
          />
          <UploadCard
            side="back"
            upload={uploads.back}
            onFileSelect={selectFile}
            onRemove={removeFile}
            onEdit={openEditor}
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
          fileName={editor.fileName}
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
