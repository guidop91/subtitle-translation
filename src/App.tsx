import './App.css'
import FileUploadInput from './components/FileUpload'
import DocumentTransform from './components/DocumentTransform'
import { useState } from 'react'

function App() {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div className="app-container">
      <h1>Arrastra o carga el subtítulo en inglés</h1>
      <FileUploadInput file={file} onFileChange={setFile} />
      <DocumentTransform file={file} />
    </div>
  )
}

export default App
