export function splitTranslatedContent(content: string): File[] {
  const files: File[] = [];
  const regex = /###_(.+?)_###\n([\s\S]*?)\n###_\/\1_###/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const originalName = match[1];
    const fileContent = match[2];

    // Extract name and extension
    const lastDotIndex = originalName.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '';

    // Create new filename with "-translated" suffix
    const translatedName = `${nameWithoutExt}-translated${extension}`;

    // Create File object
    const file = new File([fileContent], translatedName, {
      type: 'text/plain'
    });

    files.push(file);
  }

  return files;
}
