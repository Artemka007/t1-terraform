import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUploadPage } from './FileUpload'
import type { LogEntry } from '../../types/log.types'

export const UploadPage: React.FC = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[] | null>(null)

  const handleLogsLoaded = (loadedLogs: LogEntry[], fileName: string) => {
    setLogs(loadedLogs)
    localStorage.setItem('terraformLogs', JSON.stringify(loadedLogs))
    localStorage.setItem('terraformFile', fileName)
    navigate('/logs')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Загрузка логов</h1>
          <p className="text-gray-600">
            Загрузите JSON файл с логами Terraform для начала анализа
          </p>
        </div>
        <FileUploadPage onLogsLoaded={handleLogsLoaded} />
      </div>
    </div>
  )
}