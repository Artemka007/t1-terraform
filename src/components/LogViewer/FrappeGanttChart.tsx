// src/components/GanttChart/FrappeGanttChart.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import Gantt from 'frappe-gantt';
import type { Task } from 'frappe-gantt';
import type { GanttGroup, GanttItem } from '@/types/gantt.types';

interface FrappeGanttChartProps {
  data: GanttGroup[];
  onTaskClick?: (task: Task, item: GanttItem) => void;
  viewMode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
  height?: number;
}

export const FrappeGanttChart: React.FC<FrappeGanttChartProps> = ({
  data,
  onTaskClick,
  viewMode = 'Day',
  height = 600,
}) => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<Gantt | null>(null);
  const tasksMap = useRef<Map<string, GanttItem>>(new Map());

  // Преобразуем данные в формат Frappe Gantt
  const transformData = useCallback((groups: GanttGroup[]): Task[] => {
    tasksMap.current.clear();
    const tasks: Task[] = [];

    groups.forEach((group) => {
      // Добавляем задачу для группы (родительская задача)
      const groupTask: Task = {
        id: `group-${group.reqId}`,
        name: `Запрос: ${group.reqId.substring(0, 12)}...`,
        start: formatDateForGantt(group.start),
        end: formatDateForGantt(group.end),
        progress: 100,
        dependencies: '',
        custom_class: 'gantt-group',
      };
      tasks.push(groupTask);

      // Добавляем подзадачи для каждого элемента
      group.items.forEach((item) => {
        const taskId = `task-${item.id}`;
        const task: Task = {
          id: taskId,
          name: getTaskName(item),
          start: formatDateForGantt(item.start),
          end: formatDateForGantt(item.end),
          progress: 100,
          dependencies: `group-${group.reqId}`,
          custom_class: `gantt-task gantt-${item.level}`,
        };
        tasks.push(task);
        tasksMap.current.set(taskId, item);
      });
    });

    return tasks;
  }, []);

  // Вспомогательная функция для форматирования даты в YYYY-MM-DD
  const formatDateForGantt = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Вспомогательная функция для получения имени задачи
  const getTaskName = (item: GanttItem): string => {
    if (item.rpc) {
      const rpcName = item.rpc.split('.').pop() || item.rpc;
      return rpcName.length > 15 ? rpcName.substring(0, 15) + '...' : rpcName;
    }
    if (item.module) {
      return item.module.length > 15 ? item.module.substring(0, 15) + '...' : item.module;
    }
    return item.level.toUpperCase();
  };

  // Инициализация диаграммы
  useEffect(() => {
    if (!ganttRef.current || data.length === 0) return;

    const tasks = transformData(data);

    // Проверим задачи на валидность
    console.log('Gantt tasks to initialize:', tasks);
    
    const invalidTasks = tasks.filter(task => {
      const start = new Date(task.start);
      const end = new Date(task.end);
      return isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end;
    });

    if (invalidTasks.length > 0) {
      console.error('Invalid tasks found:', invalidTasks);
      return;
    }

    const options = {
      header_height: 50,
      column_width: 30,
      step: 24,
      view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
      bar_height: 20,
      bar_corner_radius: 3,
      arrow_curve: 5,
      padding: 16,
      view_mode: viewMode,
      date_format: 'YYYY-MM-DD',
      custom_popup_html: null,
      on_click: (task: Task) => {
        console.log('Task clicked:', task);
        const item = tasksMap.current.get(task.id);
        if (item && onTaskClick) {
          onTaskClick(task, item);
        }
      },
      on_date_change: (task: Task, start: Date, end: Date) => {
        console.log('Date changed:', task, start, end);
      },
      on_progress_change: (task: Task, progress: number) => {
        console.log('Progress changed:', task, progress);
      },
      on_view_change: (mode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month') => {
        console.log('View mode changed to:', mode);
      },
    };

    try {
      console.log('Initializing Gantt with options:', options);
      ganttInstance.current = new Gantt(ganttRef.current, tasks, options as any );
      console.log('Gantt chart initialized successfully');
    } catch (error) {
      console.error('Error initializing Gantt chart:', error);
      console.error('Error details:', {
        tasksCount: tasks.length,
        tasksSample: tasks.slice(0, 2),
        viewMode,
        container: ganttRef.current
      });
    }

    return () => {
      ganttInstance.current = null;
    };
  }, [data, transformData, onTaskClick, viewMode]);

  // Обновление view mode
  useEffect(() => {
    if (ganttInstance.current && viewMode) {
      try {
        ganttInstance.current.change_view_mode(viewMode);
      } catch (error) {
        console.error('Error changing view mode:', error);
      }
    }
  }, [viewMode]);

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
      <div 
        ref={ganttRef} 
        style={{ 
          height: `${height}px`, 
          overflow: 'auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }} 
      />
    </div>
  );
};