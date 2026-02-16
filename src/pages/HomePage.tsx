import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import DocumentTransform from '../components/DocumentTransform'

function HomePage() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="app-container">
      <h1>Arrastra o carga los subtítulos en inglés</h1>
      <FileUpload
        value={files}
        onChange={setFiles}
        multiple={true}
        accept=".srt,.vtt,.sub,.ass, .txt"
        id="file-upload"
        icon="📁"
        hint="Formatos soportados: SRT, VTT, SUB, ASS"
      />
      <DocumentTransform files={files} />
    </div>
  )
}

export default HomePage
