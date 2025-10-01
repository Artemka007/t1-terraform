// src/components/GanttChart/GoogleTimelineChart.tsx
import React, { useMemo } from 'react';
import { Chart } from 'react-google-charts';
import type { GanttGroup, GanttItem } from '@/types/gantt.types';

interface GoogleTimelineChartProps {
  data: GanttGroup[];
  onItemClick?: (item: GanttItem) => void;
  height?: number;
}

export const GoogleTimelineChart: React.FC<GoogleTimelineChartProps> = ({
  data,
  onItemClick,
  height = 600,
}) => {
  // Преобразуем данные в правильный формат Google Charts Timeline
  const chartData = useMemo(() => {
    const rows: any[] = [];

    // Стиль для элемента
    const getItemStyle = (item: GanttItem): string => {
      const colors = {
        info: '#3b82f6',
        warn: '#f59e0b', 
        error: '#ef4444',
        debug: '#6b7280',
      };

      return colors[item.level];
    };

    // Tooltip для элемента
    const getTooltip = (item: GanttItem): string => {
      return `
        <div style="padding: 8px; max-width: 300px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${getItemName(item)}</div>
          <div style="font-size: 12px; color: #666;">
            <div>Уровень: ${item.level}</div>
            <div>Модуль: ${item.module || 'N/A'}</div>
            <div>RPC: ${item.rpc || 'N/A'}</div>
            <div>Длительность: ${Math.round(item.duration / 1000)}s</div>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #999;">
            ${item.message.length > 100 ? item.message.substring(0, 100) + '...' : item.message}
          </div>
        </div>
      `.replace(/\s+/g, ' '); // Убираем лишние пробелы для HTML
    };

    // Имя для элемента
    const getItemName = (item: GanttItem): string => {
      if (item.rpc) {
        const rpcName = item.rpc.split('.').pop() || item.rpc;
        return `${rpcName}`;
      }
      if (item.module) {
        return `${item.module}`;
      }
      return `${item.level.toUpperCase()}`;
    };

    data.forEach((group) => {
      // Добавляем группу (родительский ряд)
      rows.push([
        `Group: ${group.reqId.substring(0, 8)}`, // Row label (будет отображаться)
        `Запрос ${group.reqId.substring(0, 8)}...`, // Bar label
        group.start,
        group.end,
        '',
        '',
      ]);

      // Добавляем элементы группы
      group.items.forEach((item) => {
        const style = getItemStyle(item);
        const tooltip = getTooltip(item);
        
        rows.push([
          `Group: ${group.reqId.substring(0, 8)}`, // Тот же row label для группировки
          {
            v: item.id,
            f: getItemName(item),
          }, // Bar label с ID для кликов
          item.start,
          item.end,
          style,
          tooltip,
        ]);
      });
    });

    // Правильный формат колонок для Timeline
    return [
      [
        { type: 'string', label: 'Group' },
        { type: 'string', label: 'Task' },
        { type: 'date', label: 'Start' },
        { type: 'date', label: 'End' },
        { type: 'string', role: 'style' },
        { type: 'string', role: 'tooltip' },
      ],
      ...rows,
    ];
  }, [data]);

  // Опции диаграммы
  const options = {
    height: height,
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
      format: 'dd.MM.yyyy HH:mm',
    },
    colors: ['#3b82f6', '#f59e0b', '#ef4444', '#6b7280'], // Цвета для разных уровней
  };

  // Обработчик кликов
  const chartEvents = [
    {
      eventName: 'select',
      callback: ({ chartWrapper }: any) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        
        if (selection.length > 0) {
          const selectedItem = selection[0];
          const rowIndex = selectedItem.row;
          
          // Получаем данные строки
          const rowData = chartData[rowIndex + 1]; // +1 потому что первая строка - заголовки
          const taskId = typeof rowData[1] === 'object' ? rowData[1].v : rowData[1];
          
          // Находим соответствующий элемент
          let selectedGanttItem: GanttItem | null = null;
          
          data.forEach(group => {
            const item = group.items.find(item => item.id === taskId);
            if (item) {
              selectedGanttItem = item;
            }
          });

          if (selectedGanttItem && onItemClick) {
            onItemClick(selectedGanttItem);
          }
        }
      },
    },
  ];

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
      <Chart
        chartType="Timeline"
        data={chartData}
        options={options}
        width="100%"
        height={`${height}px`}
        chartEvents={chartEvents as any}
        loader={
          <div className="flex justify-center items-center h-full py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-500">Загрузка диаграммы...</div>
            </div>
          </div>
        }
      />
    </div>
  );
};