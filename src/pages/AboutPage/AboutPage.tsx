import React from 'react'

export const AboutPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">О программе</h1>
        
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Terraform Log Analyzer</h2>
          <p className="text-gray-700 mb-4">
            Мощный инструмент для анализа и визуализации логов Terraform, 
            разработанный для упрощения отладки и мониторинга инфраструктурных изменений.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Основные возможности:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Загрузка JSON логов Terraform</li>
                <li>Группировка по цепочкам запросов</li>
                <li>Расширенный поиск и фильтрация</li>
                <li>Визуализация зависимостей</li>
                <li>Статистика и аналитика</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Технологии:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>React 18 + TypeScript</li>
                <li>React Router DOM</li>
                <li>Vite для сборки</li>
                <li>Tailwind CSS для стилей</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Версия: 1.0.0</h3>
            <p className="text-gray-600">
              Разработано для эффективной работы с логами Terraform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}