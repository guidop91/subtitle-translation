import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import DocumentTransform from '../components/DocumentTransform';

function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);

  return (
    <div className="app-container">
      <h1>Arrastra o carga los subtítulos en inglés</h1>
      <FileUpload
        accept=".srt,.vtt,.sub,.ass, .txt"
        hint="Formatos soportados: SRT, VTT, SUB, ASS"
        icon="📁"
        id="file-upload"
        multiple={true}
        onChange={setFiles}
        shouldCollapse={hasStartedProcessing}
        value={files}
      />
      <DocumentTransform
        files={files}
        onProcessingStart={() => setHasStartedProcessing(true)}
      />
    </div>
  );
}

export default HomePage;
