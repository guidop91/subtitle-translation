import { useState } from 'react';

function FileUploadInput({ files, onFilesChange }: {
  onFilesChange: (files: File[]) => void
  files: File[]
}) {
  const [dragActive, setDragActive] = useState(false)

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
      onFilesChange(droppedFiles)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      onFilesChange(selectedFiles)
    }
  }

  return (
    <>
      <div
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".srt,.vtt,.sub,.ass, .txt"
          onChange={handleChange}
          multiple
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="file-upload-label">
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
              <p>
                <strong>{index + 1}. {file.name}</strong>
              </p>
              <p>
                Tamaño: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default FileUploadInput;
