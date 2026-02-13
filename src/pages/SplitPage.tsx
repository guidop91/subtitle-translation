import { useState } from 'react'

function SplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSplitting, setIsSplitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
    }
  }

  const splitFile = async () => {
    if (!file) return

    setIsSplitting(true)
    setError(null)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch('http://localhost:3001/api/split-document', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to split document')
      }

      // The response is now a ZIP file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      console.error('Error splitting file:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSplitting(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Dividir DOCX en múltiples archivos</h1>
      <p className="page-description">Sube un documento DOCX agregado para recuperarlo en sus archivos originales</p>

      <div
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="split-upload"
          accept=".docx,.txt"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="split-upload" className="file-upload-label">
          <div className="upload-icon">📄</div>
          <p>
            {file
              ? file.name
              : 'Arrastra tu archivo DOCX aquí o haz clic para seleccionar'}
          </p>
          <p className="upload-hint">Formatos soportados: DOCX (archivos agregados)</p>
        </label>
      </div>

      {file && (
        <div className="file-info">
          <p><strong>Archivo seleccionado:</strong> {file.name}</p>
          <p>Tamaño: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {file && (
        <div>
          <button onClick={splitFile} disabled={isSplitting}>
            {isSplitting ? 'Dividiendo...' : 'Dividir documento'}
          </button>
        </div>
      )}

      {downloadUrl && (
        <div className="file-info">
          <h3>¡Documentos divididos!</h3>
          <a href={downloadUrl} download="split-files.zip">
            Descargar archivo ZIP
          </a>
        </div>
      )}

      {error && (
        <p className="error-message">Error: {error}</p>
      )}
    </div>
  )
}

export default SplitPage
