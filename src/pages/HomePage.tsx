import { useState } from 'react'
import FileUploadInput from '../components/FileUpload'
import DocumentTransform from '../components/DocumentTransform'

function HomePage() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="app-container">
      <h1>Arrastra o carga los subtítulos en inglés</h1>
      <FileUploadInput files={files} onFilesChange={setFiles} />
      <DocumentTransform files={files} />
    </div>
  )
}

export default HomePage
