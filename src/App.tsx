import { useState, useEffect } from 'react'
import './App.css'
import FileUploadInput from './components/FileUpload'
import DocumentTransform from './components/DocumentTransform'
import { aggregateFiles } from './utils/aggregateFiles'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [aggregatedFile, setAggregatedFile] = useState<File | null>(null)

  useEffect(() => {
    async function updateAggregatedFile() {
      const result = await aggregateFiles(files);
      setAggregatedFile(result);
    }
    updateAggregatedFile();
  }, [files])

  return (
    <div className="app-container">
      <h1>Arrastra o carga los subtítulos en inglés</h1>
      <FileUploadInput files={files} onFilesChange={setFiles} />
      <DocumentTransform file={aggregatedFile} />
    </div>
  )
}

export default App
