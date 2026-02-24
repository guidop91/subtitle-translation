import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FileUpload from '../FileUpload';
import { useState } from 'react';

function TestWrapper() {
  const [file, setFile] = useState<File | null>(null);

  return <FileUpload value={file} onChange={setFile} multiple={false} />;
}

describe('FileUpload', () => {
  describe('Single file mode', () => {
    let mockOnChange: () => null;
    beforeAll(() => {
      mockOnChange = vi.fn();
    });

    it('renders upload area with default props', () => {
      render(
        <FileUpload value={null} onChange={mockOnChange} multiple={false} />
      );
      expect(screen.getByText(/arrastra tu archivo aquí/i)).toBeInTheDocument();
    });

    it('renders with a hint if provided', () => {
      const hint = 'this is a test hint';
      render(
        <FileUpload
          value={null}
          onChange={mockOnChange}
          multiple={false}
          hint={hint}
        />
      );
      const hintRegex = new RegExp(hint, 'i');
      expect(screen.getByText(hintRegex)).toBeInTheDocument();
    });

    it('allows upload by click event on component', () => {
      const { container } = render(<TestWrapper />);

      const input = container.querySelector('input[type="file"]')!;

      const fileName = 'test-file.srt';
      const mockFile = new File(['mock content'], fileName, {
        type: 'text/plain',
      });

      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(input);

      const filenameElements = screen.getAllByText(fileName);
      const expectedSize = (mockFile.size / 1024).toFixed(2);
      expect(filenameElements).toHaveLength(2);
      expect(
        screen.getByText(new RegExp(`tamaño:.*${expectedSize}`, 'i'))
      ).toBeInTheDocument();
    });
  });

  describe('Multiple file mode', () => {
    it('renders upload area with default props', () => {
      const mockOnChange = vi.fn();
      render(
        <FileUpload value={null} onChange={mockOnChange} multiple={true} />
      );
      expect(
        screen.getByText(/Arrastra tus archivos aquí/i)
      ).toBeInTheDocument();
    });

    it('renders a list of the uploaded files', () => {});
  });
});
