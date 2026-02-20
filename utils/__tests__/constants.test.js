import { describe, it, expect } from 'vitest';
import { generateMarker, MARKER_PREFIX, MARKER_SUFFIX } from '../constants.js';

describe('Constants', () => {
  describe('generateMarker', () => {
    it('generates marker with correct format', () => {
      const marker = generateMarker('test.txt');

      expect(marker).toBe('=== FILE: test.txt ===');
    });

    it('handles filenames with spaces', () => {
      const marker = generateMarker('my file.txt');

      expect(marker).toBe('=== FILE: my file.txt ===');
    });

    it('handles filenames with special characters', () => {
      const marker = generateMarker('file-v1_123.srt');

      expect(marker).toBe('=== FILE: file-v1_123.srt ===');
    });

    it('handles filenames with multiple extensions', () => {
      const marker = generateMarker('archive.tar.gz');

      expect(marker).toBe('=== FILE: archive.tar.gz ===');
    });

    it('handles empty filename', () => {
      const marker = generateMarker('');

      expect(marker).toBe('=== FILE:  ===');
    });
  });

  describe('Marker constants', () => {
    it('has correct MARKER_PREFIX', () => {
      expect(MARKER_PREFIX).toBe('=== FILE: ');
    });

    it('has correct MARKER_SUFFIX', () => {
      expect(MARKER_SUFFIX).toBe(' ===');
    });

    it('combines prefix and suffix correctly', () => {
      const filename = 'test.txt';
      const marker = MARKER_PREFIX + filename + MARKER_SUFFIX;

      expect(marker).toBe('=== FILE: test.txt ===');
    });
  });
});
