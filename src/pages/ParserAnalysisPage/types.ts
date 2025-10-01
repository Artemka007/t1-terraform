// src/types/parser.types.ts
export interface ProcessData {
  start: string;
  end: string;
  type: string;
  status: 'success' | 'error';
  subprocesses: ProcessData[];
  start_message?: string;
  end_message?: string;
}

export interface ParserResult {
  [key: string]: ProcessData; // apply, plan и т.д.
}

export interface ProcessGanttItem {
  id: string;
  name: string;
  start: Date;
  end: Date;
  type: string;
  status: 'success' | 'error';
  level: 'info' | 'warn' | 'error';
  message?: string;
  parentId?: string;
  depth: number;
}