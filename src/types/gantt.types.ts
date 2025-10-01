export interface GanttItem {
  id: string;
  reqId: string;
  start: Date;
  end: Date;
  duration: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module?: string;
  resourceType?: string;
  rpc?: string;
}

export interface GanttGroup {
  reqId: string;
  items: GanttItem[];
  start: Date;
  end: Date;
  totalDuration: number;
  levels: {
    info: number;
    warn: number;
    error: number;
    debug: number;
  };
}

export interface GanttChartProps {
  data: GanttGroup[];
  height?: number;
  onItemClick?: (item: GanttItem) => void;
}