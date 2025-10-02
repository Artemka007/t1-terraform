import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { LogsPage } from './pages/LogsPage'
import { AboutPage } from './pages/AboutPage'
import { ParserAnalysisPage } from './pages/ParserAnalysisPage/ParserAnalysisPage'
import PluginManagerPage from './pages/PluginManagerPage/PluginManagerPage'

export const App: React.FC = () => {
  return (
    
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/parser" element={<ParserAnalysisPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/plugins" element={<PluginManagerPage />} />
          <Route path="*" element={<div className="p-8 text-center">Страница не найдена</div>} />
        </Routes>
      </Layout>
    </Router>
  )
}