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
  })
})
