import type { GanttGroup, GanttItem } from "@/types/gantt.types";
import type { LogEntry } from "@/types/log.types";
import { useMemo } from "react";

export const useGanttData = (logEntries: LogEntry[]): GanttGroup[] => {
  return useMemo(() => {
    if (logEntries.length === 0) return [];

    const groups: Record<string, GanttItem[]> = {};

    // Фильтруем записи с валидными @timestamp и tf_req_id
    const validEntries = logEntries.filter(entry => {
      if (!entry.tf_req_id) return false;
      
      if (!entry['@timestamp']) return false;
      
      const timestamp = new Date(entry['@timestamp']);
      return !isNaN(timestamp.getTime());
    });

    if (validEntries.length === 0) return [];

    // Сортируем все валидные записи по @timestamp
    const sortedEntries = validEntries.sort((a, b) => {
      const timeA = new Date(a['@timestamp']!).getTime();
      const timeB = new Date(b['@timestamp']!).getTime();
      return timeA - timeB;
    });

    // Группируем по tf_req_id
    sortedEntries.forEach(entry => {
      const reqId = entry.tf_req_id!;
      const timestamp = new Date(entry['@timestamp']!);

      // Определяем уровень
      let level: GanttItem['level'] = 'info';
      if (entry['@level']) {
        const levelStr = entry['@level'].toLowerCase();
        if (levelStr.includes('error')) level = 'error';
        else if (levelStr.includes('warn')) level = 'warn';
        else if (levelStr.includes('debug')) level = 'debug';
      } else if (entry['@message']?.toLowerCase().includes('error')) {
        level = 'error';
      } else if (entry['@message']?.toLowerCase().includes('warn')) {
        level = 'warn';
      }

      // Рассчитываем длительность на основе типа операции
      let duration = 30 * 1000; // 30 секунд по умолчанию
      
      if (entry.tf_rpc?.includes('Plan')) duration = 2 * 60 * 1000; // 2 минуты
      if (entry.tf_rpc?.includes('Apply')) duration = 3 * 60 * 1000; // 3 минуты
      if (entry.tf_rpc?.includes('Destroy')) duration = 1.5 * 60 * 1000; // 1.5 минуты
      if (level === 'error') duration = 5 * 60 * 1000; // 5 минут для ошибок
      
      // Для операций с ресурсами увеличиваем длительность
      if (entry.tf_resource_type) {
        duration *= 1.2;
      }

      const startDate = new Date(timestamp);
      const endDate = new Date(startDate.getTime() + duration);

      const item: GanttItem = {
        id: entry.id!,
        reqId,
        start: startDate,
        end: endDate,
        duration,
        level,
        message: entry['@message'] || 'No message',
        module: entry['@module'],
        resourceType: entry.tf_resource_type,
        rpc: entry.tf_rpc,
      };

      if (!groups[reqId]) {
        groups[reqId] = [];
      }
      groups[reqId].push(item);
    });

    // Преобразуем в формат групп
    const result: GanttGroup[] = Object.entries(groups).map(([reqId, items]) => {
      // Сортируем элементы по времени начала (уже должны быть отсортированы, но на всякий случай)
      const sortedItems = items.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      // Используем реальные временные метки из данных
      const start = new Date(Math.min(...sortedItems.map(item => item.start.getTime())));
      const end = new Date(Math.max(...sortedItems.map(item => item.end.getTime())));
      
      // Реальная длительность группы на основе timestamp
      const totalDuration = end.getTime() - start.getTime();

      const levels = {
        info: sortedItems.filter(item => item.level === 'info').length,
        warn: sortedItems.filter(item => item.level === 'warn').length,
        error: sortedItems.filter(item => item.level === 'error').length,
        debug: sortedItems.filter(item => item.level === 'debug').length,
      };

      return {
        reqId,
        items: sortedItems,
        start,
        end,
        totalDuration,
        levels,
      };
    });

    // Сортируем группы по времени начала
    return result.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [logEntries]);
};