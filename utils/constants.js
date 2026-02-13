/**
 * Marker used to separate files in aggregated documents
 * Format: MARKER_PREFIX + filename + MARKER_SUFFIX
 * This allows us to identify where each file begins/ends when splitting
 */
export const MARKER_PREFIX = '=== FILE: ';
export const MARKER_SUFFIX = ' ===';

/**
 * Generate a marker for a given filename
 * @param {string} filename - The name of the file
 * @returns {string} - The complete marker string
 */
export function generateMarker(filename) {
  return `${MARKER_PREFIX}${filename}${MARKER_SUFFIX}`;
}

/**
 * Extract filename from a marker line
 * @param {string} line - A line that might contain a marker
 * @returns {string|null} - The filename if line is a marker, null otherwise
 */
export function extractFilenameFromMarker(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith(MARKER_PREFIX) && trimmed.endsWith(MARKER_SUFFIX)) {
    return trimmed.slice(
      MARKER_PREFIX.length,
      -MARKER_SUFFIX.length
    );
  }
  return null;
}

/**
 * Check if a line is a marker line
 * @param {string} line - A line to check
 * @returns {boolean} - True if the line is a marker
 */
export function isMarkerLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith(MARKER_PREFIX) && trimmed.endsWith(MARKER_SUFFIX);
}
