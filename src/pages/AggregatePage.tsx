import { useState } from 'react';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';

function AggregatePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [hasStartedAggregating, setHasStartedAggregating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const aggregateFiles = async () => {
    if (files.length === 0) return;

    setHasStartedAggregating(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await fetch(
        'http://localhost:3001/api/aggregate-documents',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to aggregate documents');
      }

      // Create download URL for the aggregated DOCX
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('¡Documentos agregados exitosamente!');
    } catch (err) {
      console.error('Error aggregating files:', err);
      setError(
        err instanceof Error ? err.message : 'Error al agregar los documentos'
      );
      toast.error(
        err instanceof Error ? err.message : 'Error al agregar los documentos'
      );
    }
  };

  return (
    <div className="app-container">
      <h1>Agregar múltiples archivos a un DOCX</h1>
      <p className="page-description">
        Sube múltiples archivos de subtítulos para combinarlos en un solo
        documento DOCX
      </p>

      <FileUpload
        accept=".srt,.vtt,.sub,.ass,.txt"
        hint="Formatos soportados: SRT, VTT, SUB, ASS"
        icon="📁"
        id="aggregate-upload"
        multiple={true}
        onChange={setFiles}
        shouldCollapse={hasStartedAggregating}
        value={files}
      />

      {files.length > 0 && !hasStartedAggregating && (
        <div>
          <button onClick={aggregateFiles}>Crear DOCX</button>
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

      {error && <p className="error-message">Error: {error}</p>}
    </div>
  );
}

export default AggregatePage;
