import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import AggregatePage from './pages/AggregatePage'
import SplitPage from './pages/SplitPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav-bar">
          <NavLink to="/" className="nav-link">Traducir</NavLink>
          <NavLink to="/aggregate" className="nav-link">Agregar</NavLink>
          <NavLink to="/split" className="nav-link">Dividir</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/aggregate" element={<AggregatePage />} />
          <Route path="/split" element={<SplitPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
