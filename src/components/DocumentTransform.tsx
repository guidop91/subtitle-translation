import { useState } from "react";
import { splitTranslatedContent } from "../utils/splitFiles";

function DocumentTransform ({ file }: { file: File | null }) {
  const [error, setError] = useState<string | null>(null);
  const [translatedFiles, setTranslatedFiles] = useState<File[]>([]);

  const translateDoc = async () => {
    if (!file) return;
    setTranslatedFiles([]);
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

    // Fetch the translated file content
    const fullUrl = `http://localhost:3001${resJson.outputPath}`;
    const fileResponse = await fetch(fullUrl);
    const content = await fileResponse.text();

    // Split the translated content into individual files
    const files = splitTranslatedContent(content);
    setTranslatedFiles(files);
  };

  return (
    <>
      {file && (
        <div>
          <button onClick={translateDoc}>Traducir archivo</button>
        </div>
      )}
      {translatedFiles.length > 0 && (
        <div>
          <h3>Archivos traducidos:</h3>
          {translatedFiles.map((translatedFile, index) => {
            const url = URL.createObjectURL(translatedFile);
            return (
              <div key={index}>
                <a href={url} download={translatedFile.name}>
                  Descargar {translatedFile.name}
                </a>
              </div>
            );
          })}
        </div>
      )}
      {error && (
        <p>Un error inesperado ocurrió: {error}</p>
      )}
    </>
  )
}

export default DocumentTransform;
