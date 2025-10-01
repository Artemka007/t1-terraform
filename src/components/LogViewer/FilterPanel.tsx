import React, { useState } from 'react';
import type { FilterConfig } from '../../types/log.types';

interface FilterPanelProps {
  onFilter: (filters: FilterConfig[]) => void;
  onClear: () => void;
}

const FILTER_FIELDS = [
  { value: 'tf_resource_type', label: 'Тип ресурса', type: 'string' },
  { value: 'tf_data_source_type', label: 'Тип data source', type: 'string' },
  { value: 'tf_rpc', label: 'RPC метод', type: 'string' },
  { value: '@level', label: 'Уровень', type: 'string' },
  { value: 'tf_req_duration_ms', label: 'Длительность (ms)', type: 'number' },
  { value: '@timestamp', label: 'Время', type: 'date' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter, onClear }) => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  const addFilter = () => {
    setFilters(prev => [...prev, { field: '@level', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    setFilters(prev => prev.map((filter, i) => i === index ? { ...filter, ...updates } : filter));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const applyFilters = () => {
    onFilter(filters.filter(f => f.value !== ''));
  };

  const clearAll = () => {
    setFilters([]);
    onClear();
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Фильтры</h3>
        <div className="flex space-x-2">
          <button
            onClick={addFilter}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            + Добавить фильтр
          </button>
          <button
            onClick={applyFilters}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Применить
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Очистить
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <select
              value={filter.field}
              onChange={(e) => updateFilter(index, { field: e.target.value })}
              className="px-2 py-1 border rounded text-sm"
            >
              {FILTER_FIELDS.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="equals">равно</option>
              <option value="contains">содержит</option>
              <option value="gt">больше</option>
              <option value="lt">меньше</option>
              <option value="in">в списке</option>
            </select>

            <input
              type="text"
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
              placeholder="Значение..."
              className="flex-1 px-2 py-1 border rounded text-sm"
            />

            <button
              onClick={() => removeFilter(index)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            >
              ×
            </button>
          </div>
        ))}

        {filters.length === 0 && (
          <p className="text-sm text-gray-500 text-center">Нет активных фильтров</p>
        )}
      </div>
    </div>
  );
};