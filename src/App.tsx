import './App.css'
import FileUploadInput from './components/FileUpload'
import DocumentTransform from './components/DocumentTransform'
import { useState } from 'react'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  return (
    <div className="app-container">
      <h1>Arrastra o carga el subtítulo en inglés</h1>
      <FileUploadInput file={file} onFileChange={setFile} onContentRead={setFileContent} />
      <DocumentTransform content={fileContent} />
    </div>
  )
}

export default App
