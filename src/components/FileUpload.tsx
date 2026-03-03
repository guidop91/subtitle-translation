import { useState } from 'react';

interface FileUploadPropsBase {
  accept?: string;
  id?: string;
  icon?: string;
  hint?: string;
  shouldCollapse?: boolean;
}

interface FileUploadPropsSingle extends FileUploadPropsBase {
  multiple: false;
  value: File | null;
  onChange: (file: File | null) => void;
}

interface FileUploadPropsMultiple extends FileUploadPropsBase {
  multiple: true;
  value: File[] | null;
  onChange: (files: File[]) => void;
}

export type FileUploadProps = FileUploadPropsSingle | FileUploadPropsMultiple;

function FileUpload({
  hint,
  multiple,
  onChange,
  value,
  accept = '.srt,.vtt,.sub,.ass,.txt',
  icon = '📁',
  id = 'file-upload',
  shouldCollapse = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        onChange(droppedFiles);
      } else {
        onChange(e.dataTransfer.files[0]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        const selectedFiles = Array.from(e.target.files);
        onChange(selectedFiles);
      } else {
        onChange(e.target.files[0]);
      }
    }
  };

  // Determine label text based on mode and selection
  const getLabelText = () => {
    if (multiple) {
      const files = value as File[] | null;
      if (files && files.length > 0) {
        return `${files.length} archivos seleccionados`;
      }
      return 'Arrastra tus archivos aquí o haz clic para seleccionar';
    } else {
      const file = value as File | null;
      if (file) {
        return file.name;
      }
      return 'Arrastra tu archivo aquí o haz clic para seleccionar';
    }
  };

  return (
    <div
      className={`file-upload-wrapper ${shouldCollapse ? 'collapsing' : ''}`}
    >
      <div
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={handleChange}
          multiple={multiple}
          style={{ display: 'none' }}
        />
        <label htmlFor={id} className="file-upload-label">
          <div className="upload-icon">{icon}</div>
          <p>{getLabelText()}</p>
          {hint && <p className="upload-hint">{hint}</p>}
        </label>
      </div>

      {/* File info display - single file */}
      {!multiple && value && (
        <div className={`file-info ${shouldCollapse ? 'collapsing' : ''}`}>
          <p>
            <strong>Archivo seleccionado:</strong> {(value as File).name}
          </p>
          <p>Tamaño: {((value as File).size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {/* File info display - multiple files */}
      {multiple && value && (value as File[]).length > 0 && (
        <div className={`file-info ${shouldCollapse ? 'collapsing' : ''}`}>
          <h3>Archivos seleccionados:</h3>
          {(value as File[]).map((file, index) => (
            <div key={index} className="file-item">
              <p>
                <strong>
                  {index + 1}. {file.name}
                </strong>
              </p>
              <p>Tamaño: {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
