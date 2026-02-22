import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileUpload from '../FileUpload';

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

    it.only('allows upload by click event on component', () => {
      const id = 'file-upload-input';
      render(
        <FileUpload
          value={null}
          onChange={mockOnChange}
          multiple={false}
          id={id}
        />
      );
      // const input = screen.getByLabelText(/arrastra tu archivo aquí/i, {
      //   selector: 'input',
      // });

      // Now that we have the input targeted, fire a click event
      // Figure out how to "upload" file
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
