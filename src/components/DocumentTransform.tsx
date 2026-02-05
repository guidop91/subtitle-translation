function DocumentTransform ({ file }: { file: File | null }) {
  const translateDoc = async () => {
    // Send file to the backend for translation
    // Add polling for checking translation status
    // Download file when done
  };

  return (
    <>
      {file && (
        <div>
          <button onClick={translateDoc}>Traducir y descargar</button>
        </div>
      )}
    </>
  )
}

export default DocumentTransform;
