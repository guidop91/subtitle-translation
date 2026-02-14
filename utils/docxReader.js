import officeParser from 'officeparser';

/**
 * Extract raw text from a DOCX file, preserving line structure
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractRawTextFromDocx(filePath) {
  try {
    // Use officeparser to extract text
    const ast = await officeParser.parseOffice(filePath);

    // Process content manually to preserve empty paragraphs
    const lines = [];

    for (const node of ast.content) {
      // Get text from each paragraph/heading
      let nodeText = '';

      if (node.children) {
        // Concatenate all text from children
        for (const child of node.children) {
          if (child.text !== undefined) {
            nodeText += child.text;
          }
        }
      } else if (node.text !== undefined) {
        nodeText = node.text;
      }

      // Add the line (empty or not)
      lines.push(nodeText);
    }

    // Join lines with newlines
    return lines.join('\n');
  } catch (error) {
    throw new Error(`Failed to read DOCX file: ${error.message}`);
  }
}
