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

function TestWrapperSingle(
  props?: Omit<
    React.ComponentProps<typeof FileUpload>,
    'value' | 'onChange' | 'multiple'
  >
) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileUpload value={file} onChange={setFile} multiple={false} {...props} />
  );
}

function TestWrapperMultiple(
  props?: Omit<
    React.ComponentProps<typeof FileUpload>,
    'value' | 'onChange' | 'multiple'
  >
) {
  const [files, setFiles] = useState<File[] | null>(null);

  return (
    <FileUpload value={files} onChange={setFiles} multiple={true} {...props} />
  );
}

describe('FileUpload', () => {
  let mockOnChange: Mock;
  beforeAll(() => {
    mockOnChange = vi.fn();
  });

  afterEach(() => {
    mockOnChange.mockClear();
  });

  describe('Single file mode', () => {
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

    it('handles uploads by click with no files', () => {
      const { container } = render(
        <FileUpload value={null} onChange={mockOnChange} multiple={false} />
      );
      const input = container.querySelector('input[type="file"]')!;

      Object.defineProperty(input, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(input);
      expect(mockOnChange).not.toHaveBeenCalled();
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

      // Simulate drag over
      fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer });
      expect(dropZone).toHaveClass('drag-active');

      // Simulate drop
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      // Assert file was added
      expect(mockOnChange).toHaveBeenCalledWith(mockFile);
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('handles file dragging state with 0 files', () => {
      const { container } = render(
        <FileUpload value={null} onChange={mockOnChange} multiple={false} />
      );

      const dropZone = container.querySelector('.file-upload')!;
      const mockDataTransfer = {
        files: [],
        items: [],
      };

      // Simulate drag enter
      fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });
      expect(dropZone).toHaveClass('drag-active');

      // Simulate drop
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      // Assert file was added
      expect(mockOnChange).not.toHaveBeenCalled();
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('handles files being dragged away', () => {
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

      // Simulate drag leave - create event with explicit type
      fireEvent.dragLeave(dropZone, { dataTrasfer: mockDataTransfer });
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('handles custom icon prop', () => {
      const customIcon = '◊';
      const { container } = render(
        <FileUpload
          value={null}
          onChange={mockOnChange}
          multiple={false}
          icon={customIcon}
        />
      );

      const iconDiv = container.querySelector('.upload-icon');
      expect(iconDiv).toHaveTextContent(customIcon);
    });

    it('rejects file format not supported', () => {
      const { container } = render(
        <FileUpload value={null} onChange={mockOnChange} multiple={false} />
      );

      const dropZone = container.querySelector('.file-upload')!;
      const mockFile = new File(
        ['mock content of unsupported file'],
        'test.css',
        { type: 'text/plain' }
      );

      const mockDataTransfer = {
        files: [mockFile],
        items: [{ kind: 'file', ...mockFile }],
      };

      fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      // Even after adding a file, because it is unsupported, the component doens't change state
      expect(screen.getByText(/arrastra tu archivo aquí/i)).toBeInTheDocument();
    });

    it('handles custom accept prop', () => {
      const { container } = render(<TestWrapperSingle accept=".css" />);
      const input = container.querySelector('input[type="file"]')!;

      const fileName = 'test-file.css';
      const mockFile = new File(
        ['mock content of normally unsupported file type'],
        fileName,
        { type: 'text/plain' }
      );

      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(input);
      const fileInfo = container.querySelector('.file-info');
      expect(fileInfo).toHaveTextContent(fileName);
    });

    it('handles custom id prop', () => {
      const testId = 'test-id-mock';
      const { container } = render(<TestWrapperSingle id={testId} />);
      const input = container.querySelector('input[type="file"]')!;

      expect(input.id).toBe(testId);
    });

    it('handles shouldCollapse addition', () => {
      const { container } = render(<TestWrapperSingle shouldCollapse={true} />);
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

      const collapsedDiv1 = container.querySelector('.file-upload-wrapper');
      expect(collapsedDiv1).toHaveClass('collapsing');

      const collapsedDiv2 = container.querySelector('.file-info');
      expect(collapsedDiv2).toHaveClass('collapsing');
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

    it('accepts multiple files by dragging', () => {
      const { container } = render(
        <FileUpload value={null} onChange={mockOnChange} multiple={true} />
      );

      const dropZone = container.querySelector('.file-upload')!;
      const mockFile1 = new File(['mock content'], 'test.srt', {
        type: 'text/plain',
      });
      const mockFile2 = new File(['mock content'], 'test.srt', {
        type: 'text/plain',
      });
      const mockDataTransfer = {
        files: [mockFile1, mockFile2],
        items: [
          { kind: 'file', ...mockFile1 },
          { kind: 'file', ...mockFile2 },
        ],
      };

      // Simulate drag enter
      fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });

      // Simulate drop
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      // Assert file was added
      expect(mockOnChange).toHaveBeenCalledWith([mockFile1, mockFile2]);
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('handles shouldCollapse addition', () => {
      const { container } = render(
        <TestWrapperMultiple shouldCollapse={true} />
      );
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

      const collapsedDiv2 = container.querySelector('.file-info');
      expect(collapsedDiv2).toHaveClass('collapsing');
    });
  });
});
