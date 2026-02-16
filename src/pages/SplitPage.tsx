import { useState } from 'react'
import { toast } from 'react-toastify'
import FileUpload from '../components/FileUpload'

function SplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isSplitting, setIsSplitting] = useState(false)
  const [hasStartedSplitting, setHasStartedSplitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const splitFile = async () => {
    if (!file) return

    setHasStartedSplitting(true)
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
      toast.success('¡Documento dividido exitosamente!')
    } catch (err) {
      console.error('Error splitting file:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      toast.error(err instanceof Error ? err.message : 'Error al dividir el documento')
    } finally {
      setIsSplitting(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Dividir DOCX en múltiples archivos</h1>
      <p className="page-description">Sube un documento DOCX agregado para recuperarlo en sus archivos originales</p>

      <FileUpload
        value={file}
        onChange={setFile}
        multiple={false}
        accept=".docx,.txt"
        id="split-upload"
        icon="📄"
        hint="Formatos soportados: DOCX (archivos agregados)"
        shouldCollapse={hasStartedSplitting}
      />

      {file && !hasStartedSplitting && (
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
