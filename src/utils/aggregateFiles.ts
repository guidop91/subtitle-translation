export async function aggregateFiles(files: File[]): Promise<File | null> {
  if (files.length === 0) return null;

  if (files.length === 1) return files[0];

  const fileContents: string[] = [];

  for (const file of files) {
    const content = await file.text();
    const boundedContent = `###_${file.name}_###\n${content}\n###_/${file.name}_###`;
    fileContents.push(boundedContent);
  }

  const aggregatedContent = fileContents.join('\n\n');
  const aggregatedFile = new File([aggregatedContent], 'aggregated-subtitles.srt', {
    type: 'text/plain'
  });

  return aggregatedFile;
}
