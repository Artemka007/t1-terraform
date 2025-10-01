import React, { useState, useCallback, useMemo } from 'react';
import type { SearchConfig } from '../../types/log.types';
import { debounce } from '../../utils/debounce';
import { SearchIcon, ClearIcon } from '../../shared/icons';

interface SearchPanelProps {
  onSearch: (config: SearchConfig) => void;
  onClear: () => void;
  instantSearch?: boolean;
}

const SEARCH_FIELDS = [
  { value: '@message', label: 'Сообщение' },
  { value: '@module', label: 'Модуль' },
  { value: 'tf_rpc', label: 'RPC метод' },
  { value: 'tf_resource_type', label: 'Тип ресурса' },
  { value: 'tf_data_source_type', label: 'Тип data source' },
  { value: 'tf_provider_addr', label: 'Провайдер' },
  { value: 'all', label: 'Все поля' }
];

export const SearchPanel: React.FC<SearchPanelProps> = ({ 
  onSearch, 
  onClear,
  instantSearch = true 
}) => {
  const [query, setQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['@message']);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce((searchConfig: SearchConfig) => {
      onSearch(searchConfig);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    
    if (instantSearch && newQuery.trim()) {
      debouncedSearch({
        query: newQuery.trim(),
        fields: selectedFields.includes('all') 
          ? SEARCH_FIELDS.filter(f => f.value !== 'all').map(f => f.value)
          : selectedFields,
        caseSensitive
      });
    }
  }, [instantSearch, debouncedSearch, selectedFields, caseSensitive]);

  const handleExplicitSearch = () => {
    if (query.trim()) {
      onSearch({
        query: query.trim(),
        fields: selectedFields.includes('all') 
          ? SEARCH_FIELDS.filter(f => f.value !== 'all').map(f => f.value)
          : selectedFields,
        caseSensitive
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedFields(['@message']);
    setCaseSensitive(false);
    onClear();
  };

  const toggleField = (field: string) => {
    if (field === 'all') {
      setSelectedFields(['all']);
    } else {
      setSelectedFields(prev => 
        prev.includes(field) 
          ? prev.filter(f => f !== field && f !== 'all')
          : [...prev.filter(f => f !== 'all'), field]
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center space-x-4 mb-4 flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по логам..."
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleExplicitSearch()}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>

        <label className="flex items-center space-x-2 whitespace-nowrap">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Учет регистра</span>
        </label>

        <div className="flex space-x-2">
          {!instantSearch && (
            <button
              onClick={handleExplicitSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <SearchIcon />
              <span>Поиск</span>
            </button>
          )}
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <ClearIcon />
            <span>Очистить</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {SEARCH_FIELDS.map(field => (
          <label key={field.value} className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedFields.includes(field.value)}
              onChange={() => toggleField(field.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              {field.label}
            </span>
          </label>
        ))}
      </div>

      {instantSearch && query && (
        <div className="mt-3 text-xs text-green-600 flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Мгновенный поиск активен</span>
        </div>
      )}
    </div>
  );
};