import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export const Navigation: React.FC = () => {
  const location = useLocation()

  const navigationItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/upload', label: 'Загрузка логов', icon: '📤' },
    { path: '/logs', label: 'Просмотр логов', icon: '📊' },
    { path: '/parser', label: 'Анализ парсера', icon: '🔬' },
    { path: '/about', label: 'О программе', icon: 'ℹ️' },
  ]

  return (
    <nav className="w-64 bg-white shadow-sm border-r min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* Информационный блок */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-2">Быстрые действия</h3>
          <div className="space-y-2 text-sm">
            <p>📁 Загрузите логи Terraform</p>
            <p>🔍 Анализируйте цепочки запросов</p>
            <p>⚡ Фильтруйте и ищите</p>
          </div>
        </div>
      </div>
    </nav>
  )
}