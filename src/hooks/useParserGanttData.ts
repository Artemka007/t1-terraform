// src/hooks/useParserGanttData.ts
import { useMemo } from 'react';
import type { ParserResult, ProcessGanttItem } from '../pages/ParserAnalysisPage/types';

export const useParserGanttData = (parserResult?: ParserResult): ProcessGanttItem[] => {
  return useMemo(() => {
    if (!parserResult || Object.keys(parserResult).length === 0) return [];

    const items: ProcessGanttItem[] = [];
    let itemId = 0;

    // Функция для рекурсивного преобразования процессов
    const processToGanttItems = (
      process: any,
      parentName: string,
      depth: number = 0,
      parentId?: string
    ): void => {
      const currentId = process.start_message ? process.start_message : process.type === 'main_apply' ? 'Main apply' : 'Main plan';
      itemId++;
      
      // Определяем уровень на основе статуса
      let level: 'info' | 'warn' | 'error' = 'info';
      if (process.status === 'error') {
        level = 'error';
      }

      // Создаем основной элемент процесса
      const mainItem: ProcessGanttItem = {
        id: currentId,
        name: getProcessDisplayName(process.type, parentName),
        start: new Date(process.start),
        end: new Date(process.end),
        type: process.type,
        status: process.status,
        level,
        message: process.start_message,
        parentId,
        depth,
      };

      items.push(mainItem);

      // Обрабатываем подпроцессы
      if (process.subprocesses && process.subprocesses.length > 0) {
        process.subprocesses.forEach((subprocess: any) => {
          processToGanttItems(subprocess, process.type, depth + 1, currentId);
        });
      }
    };

    // Обрабатываем все основные процессы (apply, plan и т.д.)
    Object.entries(parserResult).filter(([itemId, val]) => !!val).forEach(([processKey, processData]) => {
      processToGanttItems(processData, processKey, 0);
    });

    return items;
  }, [parserResult]);
};

// Вспомогательная функция для форматирования имен процессов
const getProcessDisplayName = (processType: string, parentName: string): string => {
  const typeMap: { [key: string]: string } = {
    'main_apply': 'Main Apply',
    'main_plan': 'Main Plan', 
    'sub_apply': 'Sub Apply',
    'sub_plan': 'Sub Plan',
    'build_graph_plan': 'Build Graph (Plan)',
    'build_graph_apply': 'Build Graph (Apply)',
  };

  const baseName = typeMap[processType] || processType;
  
  // Для подпроцессов добавляем информацию о родителе
  if (processType.startsWith('sub_') || processType.startsWith('build_')) {
    const parentMap: { [key: string]: string } = {
      'apply': 'Apply',
      'plan': 'Plan',
    };
    const parentDisplay = parentMap[parentName] || parentName;
    return `${baseName} (${parentDisplay})`;
  }

  return baseName;
};