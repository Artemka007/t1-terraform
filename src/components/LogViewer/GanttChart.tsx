import React, { useState, useMemo, useCallback } from 'react';
import { GoogleTimelineChart } from './GoogleTimelineChart';
import type { GanttChartProps, GanttItem } from '@/types/gantt.types';

export const GanttChart: React.FC<GanttChartProps> = ({ 
  data, 
  height = 600,
  onItemClick 
}) => {
  const [selectedItem, setSelectedItem] = useState<GanttItem | null>(null);
  const [chartHeight, setChartHeight] = useState(height);

  const handleItemClick = useCallback((item: GanttItem) => {
    console.log('Timeline item clicked:', item);
    setSelectedItem(item);
    onItemClick?.(item);
  }, [onItemClick]);

  const handleZoomIn = useCallback(() => {
    setChartHeight(prev => Math.min(prev + 100, 1200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setChartHeight(prev => Math.max(prev - 100, 300));
  }, []);

  const handleResetZoom = useCallback(() => {
    setChartHeight(height);
  }, [height]);

  // Статистика
  const stats = useMemo(() => ({
    totalTasks: data.reduce((sum, group) => sum + group.items.length, 0),
    totalGroups: data.length,
    infoCount: data.reduce((sum, group) => sum + group.levels.info, 0),
    warnCount: data.reduce((sum, group) => sum + group.levels.warn, 0),
    errorCount: data.reduce((sum, group) => sum + group.levels.error, 0),
    debugCount: data.reduce((sum, group) => sum + group.levels.debug, 0),
  }), [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6 text-center">
        <div className="text-gray-500 text-lg mb-2">Нет данных для отображения</div>
        <div className="text-gray-400 text-sm">
          Загрузите логи с tf_req_id для построения диаграммы Ганта
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
              Диаграмма временной шкалы ({stats.totalGroups} цепочек)
            </h3>
            
            {/* Статистика по уровням */}
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Info: {stats.infoCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Warn: {stats.warnCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Error: {stats.errorCount}</span>
              </div>
              {stats.debugCount > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-gray-600">Debug: {stats.debugCount}</span>
                </div>
              )}
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
              <button
                onClick={handleResetZoom}
                className="px-3 py-2 hover:bg-gray-100 transition-colors border-r text-gray-700 text-sm"
                title="Сбросить высоту"
              >
                {chartHeight}px
              </button>
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

        {/* Описание */}
        <div className="mt-2 text-xs text-gray-500">
          Группировка по цепочкам запросов (tf_req_id) • Кликните на элемент для деталей
        </div>
      </div>

      {/* Диаграмма */}
      <GoogleTimelineChart
        data={data}
        height={chartHeight}
        onItemClick={handleItemClick}
      />

      {/* Панель деталей */}
      {selectedItem && (
        <div className="p-4 border-t bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Детали события</h4>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium mb-1">ID:</div>
              <div className="font-mono text-blue-900 text-xs break-all">{selectedItem.id}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Request ID:</div>
              <div className="font-mono text-blue-900 text-xs break-all">{selectedItem.reqId}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Уровень:</div>
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                selectedItem.level === 'error' ? 'bg-red-100 text-red-800' :
                selectedItem.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                selectedItem.level === 'debug' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {selectedItem.level}
              </div>
            </div>
            <div>
              <div className="text-blue-700 font-medium mb-1">Длительность:</div>
              <div className="text-blue-900">{selectedItem.duration}ms</div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <div className="text-blue-700 font-medium mb-1">Сообщение:</div>
              <div className="text-blue-900 text-xs bg-white p-2 rounded border">{selectedItem.message}</div>
            </div>
            {selectedItem.module && (
              <div>
                <div className="text-blue-700 font-medium mb-1">Модуль:</div>
                <div className="text-blue-900 text-xs">{selectedItem.module}</div>
              </div>
            )}
            {selectedItem.rpc && (
              <div>
                <div className="text-blue-700 font-medium mb-1">RPC метод:</div>
                <div className="text-blue-900 text-xs font-mono">{selectedItem.rpc}</div>
              </div>
            )}
            {selectedItem.resourceType && (
              <div>
                <div className="text-blue-700 font-medium mb-1">Тип ресурса:</div>
                <div className="text-blue-900 text-xs">{selectedItem.resourceType}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Легенда и подсказки */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex-1">
            <strong>Управление:</strong> Прокрутка • Клик по элементу • Масштабирование колесом мыши
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
              <span>Группа (успех)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span>Группа (warning)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Группа (error)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Info события</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};