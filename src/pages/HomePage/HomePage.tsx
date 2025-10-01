import React from 'react'
import { Link } from 'react-router-dom'

export const HomePage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Анализатор логов Terraform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Мощный инструмент для анализа и визуализации логов Terraform
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              to="/upload"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Начать работу
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Узнать больше
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl mb-4">📤</div>
            <h3 className="font-semibold text-lg mb-2">Загрузка логов</h3>
            <p className="text-gray-600">
              Загружайте JSON файлы с логами Terraform через удобный интерфейс
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg mb-2">Анализ и поиск</h3>
            <p className="text-gray-600">
              Мощные инструменты поиска и фильтрации для быстрого нахождения нужной информации
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="font-semibold text-lg mb-2">Визуализация</h3>
            <p className="text-gray-600">
              Группировка логов по цепочкам запросов и наглядное отображение данных
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}