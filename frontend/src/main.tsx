import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import Login from './admin/login.tsx'
import './index.css'
import Admin from './admin/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path='/admin' element={<Admin />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </Router>
  </StrictMode>,
)
