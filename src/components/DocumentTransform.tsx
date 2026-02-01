import { useState } from "react";

function DocumentTransform ({ file }: { file: File | null }) {
  const [content, setContent] = useState<string>('');
  function readFileContents() {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target?.result as string;
      setContent(fileText)
    }
    reader.onerror = () => {
      console.error('Error reading file');
    }
    reader.readAsText(file!);
    console.log(content.slice(0, 100))
  }
  return (
    <>
      <button onClick={readFileContents}>Convertir archivo</button>
    </>
  )
}

export default DocumentTransform;
