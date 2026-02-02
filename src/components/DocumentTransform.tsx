import { Document, Packer, Paragraph, TextRun } from "docx";

function DocumentTransform ({ content }: { content: string }) {
  const downloadAsDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: content,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "subtitle.docx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {content && (
        <div>
          <p>File content loaded: {content.slice(0, 100)}...</p>
          <button onClick={downloadAsDocx}>Descargar documento Word</button>
        </div>
      )}
    </>
  )
}

export default DocumentTransform;
