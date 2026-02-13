import { useState } from 'react'

function AggregatePage() {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isAggregating, setIsAggregating] = useState(false)
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
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles(droppedFiles)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)
    }
  }

  const aggregateFiles = async () => {
    if (files.length === 0) return

    setIsAggregating(true)
    setError(null)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('documents', file)
      })

      const response = await fetch('http://localhost:3001/api/aggregate-documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to aggregate documents')
      }

      // Create download URL for the aggregated DOCX
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      console.error('Error aggregating files:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsAggregating(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Agregar múltiples archivos a un DOCX</h1>
      <p className="page-description">Sube múltiples archivos de subtítulos para combinarlos en un solo documento DOCX</p>

      <div
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="aggregate-upload"
          accept=".srt,.vtt,.sub,.ass,.txt"
          onChange={handleChange}
          multiple
          style={{ display: 'none' }}
        />
        <label htmlFor="aggregate-upload" className="file-upload-label">
          <div className="upload-icon">📁</div>
          <p>
            {files.length > 0
              ? `${files.length} archivo${files.length > 1 ? 's' : ''} seleccionado${files.length > 1 ? 's' : ''}`
              : 'Arrastra tus archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="upload-hint">Formatos soportados: SRT, VTT, SUB, ASS</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-info">
          <h3>Archivos seleccionados:</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <p><strong>{index + 1}. {file.name}</strong></p>
              <p>Tamaño: {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div>
          <button onClick={aggregateFiles} disabled={isAggregating}>
            {isAggregating ? 'Agregando...' : 'Crear DOCX'}
          </button>
        </div>
      )}

      {downloadUrl && (
        <div className="file-info">
          <h3>¡Documento creado!</h3>
          <a href={downloadUrl} download="aggregated-document.docx">
            Descargar documento agregado
          </a>
        </div>
      )}

      {error && (
        <p className="error-message">Error: {error}</p>
      )}
    </div>
  )
}

export default AggregatePage
