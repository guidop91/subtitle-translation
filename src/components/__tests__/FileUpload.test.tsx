import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FileUpload from '../FileUpload';
import { useState } from 'react';

function TestWrapperSingle() {
  const [file, setFile] = useState<File | null>(null);

  return <FileUpload value={file} onChange={setFile} multiple={false} />;
}

function TestWrapperMultiple() {
  const [files, setFiles] = useState<File[] | null>(null);

  return <FileUpload value={files} onChange={setFiles} multiple={true} />;
}

describe('FileUpload', () => {
  describe('Single file mode', () => {
    let mockOnChange: Mock;
    beforeAll(() => {
      mockOnChange = vi.fn();
    });

    afterEach(() => {
      mockOnChange.mockClear();
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
      const { container } = render(<TestWrapperSingle />);
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

    it('handles file dragging state', () => {
      const { container } = render(
        <FileUpload value={null} onChange={mockOnChange} multiple={false} />
      );

      const dropZone = container.querySelector('.file-upload')!;
      const mockFile = new File(['mock content'], 'test.srt', {
        type: 'text/plain',
      });
      const mockDataTransfer = {
        files: [mockFile],
        items: [{ kind: 'file', ...mockFile }],
      };

      // Simulate drag enter
      fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });
      expect(dropZone).toHaveClass('drag-active');

      // Simulate drop
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      // Assert file was added
      expect(mockOnChange).toHaveBeenCalledWith(mockFile);
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('handles custom icon prop', () => {});

    it('rejects file format not supported', () => {});

    it('handles custom accept prop', () => {});

    it('handles custom id prop', () => {});

    it('handles shouldCollapse addition', () => {});
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

    it('renders a list of the uploaded files', () => {
      const { container } = render(<TestWrapperMultiple />);

      const input = container.querySelector('input[type="file"]')!;

      const fileName1 = 'test-file-1.srt';
      const mockFile1 = new File(['mock content'], fileName1, {
        type: 'text/plain',
      });

      const fileName2 = 'test-file-2.srt';
      const mockFile2 = new File(['mock content'], fileName2, {
        type: 'text/plain',
      });

      Object.defineProperty(input, 'files', {
        value: [mockFile1, mockFile2],
        writable: false,
      });

      fireEvent.change(input);

      const fileItems = container.querySelectorAll('.file-item');
      expect(fileItems).toHaveLength(2);

      expect(fileItems[0]).toHaveTextContent(fileName1);
      expect(fileItems[1]).toHaveTextContent(fileName2);
    });

    it('correctly displays number of files added', () => {});
  });
});
