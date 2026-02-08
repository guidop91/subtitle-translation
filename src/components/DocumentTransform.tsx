import { useState } from "react";

function DocumentTransform ({ file }: { file: File | null }) {
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const translateDoc = async () => {
    if (!file) return;
    setDownloadUrl(null);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('targetLang', 'ES');

    const response = await fetch('http://localhost:3001/api/translate-document', {
      method: 'POST',
      body: formData
    })

    const resJson = await response.json();
    if (!response.ok) {
      console.error('Error al traducir el documento', resJson.error);
      setError(resJson.error);
      return;
    }

    // Create full URL for the translated file
    const fullUrl = `http://localhost:3001${resJson.outputPath}`;
    setDownloadUrl(fullUrl);
  };

  return (
    <>
      {file && (
        <div>
          <button onClick={translateDoc}>Traducir archivo</button>
        </div>
      )}
      {downloadUrl && (
        <div>
          <a href={downloadUrl} download={file?.name.replace(/\.[^/.]+$/, '') + '-translated.srt'}>
            Descargar el archivo traducido
          </a>
        </div>
      )}
      {error && (
        <p>Un error inesperado ocurrió: {error}</p>
      )}
    </>
  )
}

export default DocumentTransform;
