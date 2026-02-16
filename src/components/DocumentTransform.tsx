import { useState } from "react";
import { toast } from 'react-toastify';

function DocumentTransform ({ files }: { files: File[] }) {
  const [error, setError] = useState<string | null>(null);
  const [translatedFiles, setTranslatedFiles] = useState<File[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const translateDoc = async () => {
    if (files.length === 0) return;
    setTranslatedFiles([]);
    setError(null);
    setIsTranslating(true);

    const results: File[] = [];

    // Process each file sequentially
    for (const file of files) {
      setCurrentFileName(file.name);

      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('targetLang', 'ES');

        const response = await fetch('http://localhost:3001/api/translate-document', {
          method: 'POST',
          body: formData
        });

        const resJson = await response.json();
        if (!response.ok) {
          throw new Error(resJson.error || `Failed to translate ${file.name}`);
        }

        // Fetch the translated file content
        const fullUrl = `http://localhost:3001${resJson.outputPath}`;
        const fileResponse = await fetch(fullUrl);

        if (!fileResponse.ok) {
          throw new Error(`Failed to download translated file for ${file.name}`);
        }

        const content = await fileResponse.text();

        // Create translated file with "-translated" suffix
        const lastDotIndex = file.name.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
        const extension = lastDotIndex > 0 ? file.name.substring(lastDotIndex) : '';
        const translatedName = `${nameWithoutExt}-translated${extension}`;

        const translatedFile = new File([content], translatedName, {
          type: 'text/plain'
        });

        results.push(translatedFile);
      } catch (err) {
        console.error(`Error translating ${file.name}:`, err);
        const errorMsg = `Error translating ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast.error(errorMsg);
        setIsTranslating(false);
        setCurrentFileName(null);
        return;
      }
    }

    setTranslatedFiles(results);
    setIsTranslating(false);
    setCurrentFileName(null);
    toast.success(`¡${results.length} archivo${results.length > 1 ? 's' : ''} traducido${results.length > 1 ? 's' : ''} exitosamente!`);
  };

  return (
    <>
      {files.length > 0 && (
        <div>
          <button onClick={translateDoc} disabled={isTranslating}>
            {isTranslating ? 'Traduciendo...' : 'Traducir archivos'}
          </button>
          {isTranslating && currentFileName && (
            <p style={{fontSize: '0.9em', color: '#666'}}>
              Traduciendo: {currentFileName}
            </p>
          )}
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
