// src/pages/ParserAnalysisPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ParserGanttChart } from './ParserGanttChart';
import type { ParserResult, ProcessGanttItem } from './types';
import { useParsedData } from '@/hooks/useParsedData';

// Mock данные для демонстрации (замените на реальные данные из парсера)
const mockParserResult: ParserResult = {
  apply: {
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T10:05:30Z',
    type: 'main_apply',
    status: 'success',
    start_message: 'CLI args: []string{"terraform", "apply"}',
    subprocesses: [
      {
        start: '2024-01-15T10:00:30Z',
        end: '2024-01-15T10:02:00Z',
        type: 'build_graph_apply',
        status: 'success',
        start_message: 'Building and walking apply graph',
        subprocesses: [],
      },
      {
        start: '2024-01-15T10:02:15Z',
        end: '2024-01-15T10:04:45Z',
        type: 'sub_apply',
        status: 'success',
        start_message: 'Starting apply for resource',
        subprocesses: [],
      },
    ],
  },
  plan: {
    start: '2024-01-15T09:50:00Z',
    end: '2024-01-15T09:55:00Z',
    type: 'main_plan',
    status: 'error',
    start_message: 'CLI args: []string{"terraform", "plan"}',
    subprocesses: [
      {
        start: '2024-01-15T09:50:30Z',
        end: '2024-01-15T09:52:00Z',
        type: 'build_graph_plan',
        status: 'success',
        start_message: 'Building and walking plan graph',
        subprocesses: [],
      },
      {
        start: '2024-01-15T09:52:15Z',
        end: '2024-01-15T09:54:00Z',
        type: 'sub_plan',
        status: 'error',
        start_message: 'Plan operation started',
        end_message: 'Error: Configuration invalid',
        subprocesses: [],
      },
    ],
  },
};

export const ParserAnalysisPage: React.FC = () => {
  const {fetchResults, results: parserResult} = useParsedData();

  useEffect(() => {
    fetchResults(localStorage.getItem('terraformFile')!);
  }, []);

  const handleItemClick = useCallback((item: ProcessGanttItem) => {
    console.log('Process item clicked:', item);
  }, []);

  const handleLoadFromParser = useCallback(() => {
    // Здесь будет логика загрузки реальных данных из парсера
    // Например, вызов API или использование данных из localStorage
    console.log('Loading data from parser...');
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Анализ процессов Terraform
              </h1>
              <p className="text-gray-600">
                Визуализация результатов парсера логов - иерархия процессов и их статусы
              </p>
            </div>
            <button
              onClick={handleLoadFromParser}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Загрузить из парсера
            </button>
          </div>
        </div>

        <ParserGanttChart
          parserResult={parserResult?.result || {}}
          height={700}
          onItemClick={handleItemClick}
        />

        {/* Дополнительная информация */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Как читать диаграмму:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Зеленые</strong> процессы выполнены успешно</li>
            <li>• <strong>Красные</strong> процессы завершились с ошибкой</li>
            <li>• <strong>Группировка</strong> показывает уровни вложенности процессов</li>
            <li>• <strong>Кликните на процесс</strong> для просмотра деталей</li>
            <li>• <strong>Main Processes</strong> - основные процессы Apply и Plan</li>
            <li>• <strong>Subprocesses</strong> - вложенные процессы построения графов и операций</li>
          </ul>
        </div>
      </div>
    </div>
  );
};