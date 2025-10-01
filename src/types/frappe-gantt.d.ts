// src/types/frappe-gantt.d.ts
declare module 'frappe-gantt' {
  export interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies: string;
    custom_class?: string;
  }

  export interface GanttOptions {
    header_height?: number;
    column_width?: number;
    step?: number;
    view_modes?: ('Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month')[];
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    view_mode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
    date_format?: string;
    custom_popup_html?: (task: Task) => string;
    on_click?: (task: Task) => void;
    on_date_change?: (task: Task, start: Date, end: Date) => void;
    on_progress_change?: (task: Task, progress: number) => void;
    on_view_change?: (mode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month') => void;
  }

  export class Gantt {
    constructor(
      wrapper: string | HTMLElement,
      tasks: Task[],
      options?: GanttOptions
    );
    
    change_view_mode(mode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'): void;
    refresh(tasks: Task[]): void;
    add_task(task: Task): void;
  }

  export default Gantt;
}