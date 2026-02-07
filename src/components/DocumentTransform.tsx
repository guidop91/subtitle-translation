function DocumentTransform ({ file }: { file: File | null }) {
  const translateDoc = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    fetch('http://localhost:3001/api/translate-document', {
      method: 'POST',
      body: formData
    })
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
