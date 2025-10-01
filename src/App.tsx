import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { LogsPage } from './pages/LogsPage'
import { AboutPage } from './pages/AboutPage'

export const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </Layout>
    </Router>
  )
}