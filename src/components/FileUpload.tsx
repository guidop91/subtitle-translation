import { useState } from 'react';

function FileUploadInput({ file, onFileChange }: {
  onFileChange: (file: File | null) => void
  file: File | null
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      console.log(droppedFile)
      onFileChange(droppedFile)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      onFileChange(selectedFile)
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
          accept=".srt,.vtt,.sub,.ass"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="file-upload-label">
          <div className="upload-icon">📁</div>
          <p>
            {file
              ? file.name
              : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
          </p>
          <p className="upload-hint">Formatos soportados: SRT, VTT, SUB, ASS</p>
        </label>
      </div>
      {file && (
        <div className="file-info">
          <p>
            <strong>Archivo seleccionado:</strong> {file.name}
          </p>
          <p>
            <strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
    </>
  );
}

export default FileUploadInput;
