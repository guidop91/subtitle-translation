import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FileUpload from '../FileUpload'

describe('FileUpload', () => {
  describe('Single file mode', () => {
    it('renders upload area with default props', () => {
      const mockOnChange = vi.fn()
      render(
        <FileUpload
          value={null}
          onChange={mockOnChange}
          multiple={false}
        />
      )
      expect(screen.getByText(/arrastra tu archivo aquí/i)).toBeInTheDocument()
    })

    it('renders the name and size of the uploaded file', () => {

    });

    it('renders with a hint if provided', () => {

    });
  });

  describe('Multiple file mode', () => {
    it.skip('renders upload area with default props', () => {
      // Figure out how to add test files to component
      const mockOnChange = vi.fn()
      render(
        <FileUpload
          value={null}
          onChange={mockOnChange}
          multiple={true}
        />
      )
      expect(screen.getByText(/Arrastra tus archivos aquí/i)).toBeInTheDocument()
    });

    it('renders a list of the uploaded files', () => {
      
    });


  })
})
