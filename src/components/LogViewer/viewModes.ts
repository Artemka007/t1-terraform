import type Gantt from "frappe-gantt";

export const VIEW_MODES: Gantt.ViewModeObject[] = [
  {
    name: 'Quarter Day',
    column_width: 60,
    step: '6', // 6 часов в шаге
    date_format: 'HH:mm',
    upper_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    },
    lower_text: (date: Date) => {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit' });
    }
  },
  {
    name: 'Half Day',
    column_width: 50,
    step: '12', // 12 часов в шаге
    date_format: 'HH:mm',
    upper_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    },
    lower_text: (date: Date) => {
      const hours = date.getHours();
      return hours < 12 ? 'Утро' : 'Вечер';
    }
  },
  {
    name: 'Day',
    column_width: 40,
    step: '24', // 24 часа в шаге
    date_format: 'DD MMM',
    upper_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    },
    lower_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  },
  {
    name: 'Week',
    column_width: 35,
    step: (24 * 7).toString(), // 7 дней в шаге
    date_format: 'DD MMM',
    upper_text: (date: Date) => {
      const startOfWeek = new Date(date);
      const endOfWeek = new Date(date);
      endOfWeek.setDate(date.getDate() + 6);
      return `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString('ru-RU', { month: 'short' })} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('ru-RU', { month: 'short' })}`;
    },
    lower_text: (date: Date) => {
      return `Неделя ${Math.ceil(date.getDate() / 7)}`;
    }
  },
  {
    name: 'Month',
    column_width: 30,
    step: (24 * 30).toString(), // 30 дней в шаге
    date_format: 'MMMM YYYY',
    upper_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    },
    lower_text: (date: Date) => {
      return date.toLocaleDateString('ru-RU', { month: 'short' });
    }
  }
];