import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogViewer } from '@/components/LogViewer/LogViewer'
import type { LogEntry } from '@/types/log.types'

export const LogsPage: React.FC = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[] | null>(null)

  useEffect(() => {
    // Загружаем логи из localStorage
    const savedLogs = localStorage.getItem('terraformLogs')
    if (savedLogs) {
      try {
        setLogs((JSON.parse(savedLogs) as any[]).map((i, id) => ({...i, id: String(id) + '-' + i['@message']})))
      } catch (error) {
        console.error('Ошибка при загрузке логов:', error)
      }
    }
  }, [])

  if (!logs) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-6">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Логи не загружены
            </h2>
            <p className="text-yellow-700 mb-4">
              Для просмотра логов необходимо сначала загрузить файл
            </p>
            <Link
              to="/upload"
              className="inline-block px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Перейти к загрузке
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 bg-white border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Просмотр логов ({logs.length} записей)
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Загрузить другой файл
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('terraformLogs')
                navigate('/')
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Очистить логи
            </button>
          </div>
        </div>
      </div>
      <LogViewer initialLogs={logs} />
    </div>
  )
}