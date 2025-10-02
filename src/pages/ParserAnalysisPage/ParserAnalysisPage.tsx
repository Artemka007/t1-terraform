// src/pages/ParserAnalysisPage.tsx
import React, { useCallback, useEffect } from 'react';
import { ParserGanttChart } from './ParserGanttChart';
import type { ProcessGanttItem } from './types';
import { useParsedData } from '@/hooks/useParsedData';

export const ParserAnalysisPage: React.FC = () => {
  const {fetchResults, results: parserResult} = useParsedData();

  useEffect(() => {
    fetchResults(localStorage.getItem('terraformFile')!);
  }, []);

  const handleItemClick = useCallback((item: ProcessGanttItem) => {
    console.log('Process item clicked:', item);
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