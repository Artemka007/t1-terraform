// src/components/ParserGantt/ParserGanttChart.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import type { ParserResult, ProcessGanttItem } from './types';
import { useParserGanttData } from '../../hooks/useParserGanttData';

interface ParserGanttChartProps {
  parserResult: ParserResult;
  height?: number;
  onItemClick?: (item: ProcessGanttItem) => void;
}

export const ParserGanttChart: React.FC<ParserGanttChartProps> = ({
  parserResult,
  height = 600,
  onItemClick,
}) => {
  const ganttData = useParserGanttData(parserResult);
  const [selectedItem, setSelectedItem] = useState<ProcessGanttItem | null>(null);
  const [chartHeight, setChartHeight] = useState(height);

  // Стиль для элемента
  const getItemStyle = (item: ProcessGanttItem): string => {
    const colors = {
      info: '#10b981', // green for success
      error: '#ef4444', // red for error
      warn: '#f59e0b',  // yellow for warnings
    };

    // Разные оттенки для разных уровней вложенности
    const opacity = Math.max(0.3, 1 - (item.depth * 0.15));
    const color = colors[item.level];
    
    return `color: ${color}; opacity: ${opacity}; stroke-color: ${color}; stroke-width: 2`;
  };

  // Tooltip для элемента
  const getTooltip = (item: ProcessGanttItem): string => {
    const statusColor = item.status === 'success' ? '#10b981' : '#ef4444';
    
    return `
      <div style="padding: 12px; max-width: 400px; font-family: system-ui;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">
          ${item.name}
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; margin-right: 6px;"></div>
          <span style="font-size: 12px; color: #6b7280;">Status: </span>
          <span style="font-size: 12px; font-weight: 500; color: ${statusColor}; margin-left: 4px;">
            ${item.status.toUpperCase()}
          </span>
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
          Type: ${item.type}
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
          Start: ${item.start.toLocaleString()}
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
          End: ${item.end.toLocaleString()}
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
          Duration: ${Math.round((item.end.getTime() - item.start.getTime()) / 1000)}s
        </div>
        ${item.message ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <div style="font-size: 11px; color: #6b7280; font-weight: 500;">Message:</div>
            <div style="font-size: 11px; color: #374151; margin-top: 2px;">${item.message}</div>
          </div>
        ` : ''}
      </div>
    `.replace(/\s+/g, ' ');
  };

  // Имя группы для группировки
  const getGroupName = (item: ProcessGanttItem): string => {
    if (item.depth === 0) {
      return 'Main Processes';
    } else if (item.depth === 1) {
      return 'Subprocesses';
    } else {
      return `Nested Level ${item.depth}`;
    }
  };

  // Преобразуем данные в формат Google Charts
  const chartData = useMemo(() => {
    const rows: any[] = [];

    ganttData.forEach((item) => {
      const style = getItemStyle(item);
      const tooltip = getTooltip(item);
      
      // Для группировки используем уровень вложенности
      const groupName = getGroupName(item);
      
      rows.push([
        groupName,
        {
          v: item.id,
          f: item.name,
        },
        item.start,
        item.end,
        style,
        tooltip,
        item.depth, // для сортировки по уровню вложенности
      ]);
    });

    return [
      [
        { type: 'string', label: 'Process Group' },
        { type: 'string', label: 'Process' },
        { type: 'date', label: 'Start' },
        { type: 'date', label: 'End' },
        { type: 'string', role: 'style' },
        { type: 'string', role: 'tooltip' },
        { type: 'number', role: 'annotation' }, // для глубины вложенности
      ],
      ...rows.sort((a, b) => a[6] - b[6]), // Сортируем по глубине
    ];
  }, [ganttData]);

  // Опции диаграммы
  const options = {
    height: chartHeight,
    timeline: {
      groupByRowLabel: true,
      colorByRowLabel: false,
      showRowLabels: true,
      showBarLabels: true,
      singleColor: null,
    },
    avoidOverlappingGridLines: true,
    backgroundColor: '#f8fafc',
    tooltip: {
      isHtml: true,
    },
    hAxis: {
      format: 'dd.MM.yyyy HH:mm:ss',
    },
  };

  // Обработчик кликов
  const chartEvents = [
    {
      eventName: 'select',
      callback: ({ chartWrapper }: any) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        
        if (selection.length > 0) {
          const selectedItemData = selection[0];
          const rowIndex = selectedItemData.row;
          const rowData = chartData[rowIndex + 1];
          const itemId = typeof rowData[1] === 'object' ? rowData[1].v : rowData[1];
          
          const item = ganttData.find(item => item.id === itemId);
          if (item) {
            setSelectedItem(item);
            onItemClick?.(item);
          }
        }
      },
    },
  ];

  const handleZoomIn = useCallback(() => {
    setChartHeight(prev => Math.min(prev + 100, 1200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setChartHeight(prev => Math.max(prev - 100, 300));
  }, []);

  // Статистика
  const stats = useMemo(() => {
    const mainProcesses = ganttData.filter(item => item.depth === 0);
    const subprocesses = ganttData.filter(item => item.depth > 0);
    const errorProcesses = ganttData.filter(item => item.status === 'error');
    
    return {
      totalProcesses: ganttData.length,
      mainProcesses: mainProcesses.length,
      subprocesses: subprocesses.length,
      errorProcesses: errorProcesses.length,
      successProcesses: ganttData.length - errorProcesses.length,
    };
  }, [ganttData]);

  if (ganttData.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6 text-center">
        <div className="text-gray-500 text-lg mb-2">Нет данных парсера для отображения</div>
        <div className="text-gray-400 text-sm">
          Запустите парсер для анализа логов Terraform
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Панель управления */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Анализ процессов Terraform
            </h3>
            
            {/* Статистика */}
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Success: {stats.successProcesses}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Error: {stats.errorProcesses}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Total: {stats.totalProcesses}</span>
              </div>
            </div>
          </div>

          {/* Элементы управления зумом */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Высота:</span>
            <div className="flex bg-white border rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={handleZoomOut}
                className="px-3 py-2 hover:bg-gray-100 transition-colors border-r text-gray-700"
                title="Уменьшить высоту"
              >
                <span className="text-lg font-medium">-</span>
              </button>
              <div className="px-3 py-2 border-r text-gray-700 text-sm flex items-center">
                {chartHeight}px
              </div>
              <button
                onClick={handleZoomIn}
                className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-700"
                title="Увеличить высоту"
              >
                <span className="text-lg font-medium">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Диаграмма */}
      <Chart
        chartType="Timeline"
        data={chartData}
        options={options}
        width="100%"
        height={`${chartHeight}px`}
        chartEvents={chartEvents as any}
        loader={
          <div className="flex justify-center items-center h-full py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-500">Загрузка диаграммы процессов...</div>
            </div>
          </div>
        }
      />

      {/* Панель деталей */}
      {selectedItem && (
        <div className="p-4 border-t bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Детали процесса</h4>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <span>Закрыть</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium mb-1">Название:</div>
              <div className="text-blue-900 font-medium">{selectedItem.name}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Тип:</div>
              <div className="text-blue-900">{selectedItem.type}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Статус:</div>
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                selectedItem.status === 'error' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedItem.status.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Уровень вложенности:</div>
              <div className="text-blue-900">{selectedItem.depth}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Начало:</div>
              <div className="text-blue-900 text-xs">{selectedItem.start.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Окончание:</div>
              <div className="text-blue-900 text-xs">{selectedItem.end.toLocaleString()}</div>
            </div>
            <div className="md:col-span-3">
              <div className="text-blue-700 font-medium mb-1">Длительность:</div>
              <div className="text-blue-900">
                {Math.round((selectedItem.end.getTime() - selectedItem.start.getTime()) / 1000)} секунд
              </div>
            </div>
            {selectedItem.message && (
              <div className="md:col-span-3">
                <div className="text-blue-700 font-medium mb-1">Сообщение:</div>
                <div className="text-blue-900 text-xs bg-white p-2 rounded border">{selectedItem.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Легенда */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex-1">
            <strong>Управление:</strong> Прокрутка • Клик по процессу для деталей • Масштабирование колесом мыши
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Успешные процессы</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Процессы с ошибками</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-50"></div>
              <span>Вложенные процессы</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};