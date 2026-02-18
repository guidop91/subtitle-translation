import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders navigation with all links', () => {
    renderWithRouter(<App />)

    expect(screen.getByText('Traducir')).toBeInTheDocument()
    expect(screen.getByText('Agregar')).toBeInTheDocument()
    expect(screen.getByText('Dividir')).toBeInTheDocument()
  })

  it('renders home page by default', () => {
    renderWithRouter(<App />)

    // HomePage should be rendered at the root path
    // You can add more specific assertions based on your HomePage content
    expect(screen.getByText('Traducir')).toBeInTheDocument()
  })

  it('renders ToastContainer', () => {
    const { container } = renderWithRouter(<App />)

    // ToastContainer adds a div with class Toastify
    const toastContainer = container.querySelector('.Toastify')
    expect(toastContainer).toBeInTheDocument()
  })
})
