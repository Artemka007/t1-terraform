import React, { useState, useMemo, useCallback } from 'react'
import { LogEntryComponent } from './LogEntry'
import { SearchPanel } from './SearchPanel'
import { FilterPanel } from './FilterPanel'
import { GanttChart } from './GanttChart'
import { useGanttData } from '../../hooks/useGanttData'
import type { LogEntry, RequestChain as RequestChainType, FilterConfig, SearchConfig } from '@/types/log.types'
import type { GanttItem } from '@/types/gantt.types'

interface LogViewerProps {
  initialLogs: LogEntry[]
}

// Mock hooks
const useLogData = (initialLogs: LogEntry[]) => {
  const [logData] = useState<LogEntry[]>(initialLogs)
  const [readEntries, setReadEntries] = useState<Set<string>>(new Set())

  const markAsRead = useCallback((id: string) => {
    setReadEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  return { logData, readEntries, markAsRead }
}

const useSearch = (logData: LogEntry[]) => {
  const [searchResults, setSearchResults] = useState<LogEntry[]>(logData);

  const search = useCallback((config: SearchConfig) => {
    if (!config.query.trim()) {
      setSearchResults(logData);
      return;
    }

    const results = logData.filter(entry => 
      entry['@message']?.toLowerCase().includes(config.query.toLowerCase()) ||
      entry['@module']?.toLowerCase().includes(config.query.toLowerCase()) ||
      entry.tf_rpc?.toLowerCase().includes(config.query.toLowerCase()) ||
      entry.tf_resource_type?.toLowerCase().includes(config.query.toLowerCase())
    );
    setSearchResults(results);
  }, [logData]);

  const clearSearch = useCallback(() => {
    setSearchResults(logData);
  }, [logData]);

  return { searchResults, search, clearSearch };
};

const useFilters = (logData: LogEntry[]) => {
  const [filteredData, setFilteredData] = useState<LogEntry[]>(logData);
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);

  const applyFilters = useCallback((filters: FilterConfig[]) => {
    setActiveFilters(filters);
    
    if (filters.length === 0) {
      setFilteredData(logData);
      return;
    }

    const filtered = logData.filter(entry => {
      return filters.every(filter => {
        const fieldValue = entry[filter.field as keyof LogEntry];
        const filterValue = filter.value;
        
        // Для строковых значений
        if (typeof fieldValue === 'string' && typeof filterValue === 'string') {
          return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        
        // Для точного совпадения
        return fieldValue === filterValue;
      });
    });
    
    setFilteredData(filtered);
  }, [logData]);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setFilteredData(logData);
  }, [logData]);

  return { 
    filteredData, 
    activeFilters,
    applyFilters, 
    clearFilters 
  };
};

export const LogViewer: React.FC<LogViewerProps> = ({ initialLogs }) => {
  const { logData, readEntries, markAsRead } = useLogData(initialLogs)
  const { searchResults, search, clearSearch } = useSearch(logData);
  const { filteredData, activeFilters, applyFilters, clearFilters } = useFilters(logData);
  
  const [activeTab, setActiveTab] = useState<'all' | 'search' | 'filtered' | 'gantt'>('all');
  const [viewMode, setViewMode] = useState<'single' | 'chains'>('single');
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(['info', 'warn', 'error', 'debug'])
  );

  // Обработчики смены вкладок
  const handleTabChange = useCallback((tab: 'all' | 'search' | 'filtered' | 'gantt') => {
    setActiveTab(tab);
  }, []);

  const handleSearch = useCallback((config: SearchConfig) => {
    search(config);
    setActiveTab('search');
  }, [search]);

  const handleFilter = useCallback((filters: FilterConfig[]) => {
    applyFilters(filters);
    setActiveTab('filtered');
  }, [applyFilters]);

  const handleClearAll = useCallback(() => {
    clearSearch();
    clearFilters();
    setActiveTab('all');
  }, [clearSearch, clearFilters]);

  // Данные для отображения в зависимости от активной вкладки
  const displayData = useMemo(() => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'filtered':
        return filteredData;
      default:
        return logData;
    }
  }, [activeTab, logData, searchResults, filteredData]);

  // Фильтрация логов для диаграммы Ганта
  const ganttLogs = useMemo(() => {
    return displayData.filter(log => {
      if (!log.tf_req_id) return false;

      // Определяем уровень лога
      let level = 'info';
      if (log['@level']) {
        const levelStr = log['@level'].toLowerCase();
        if (levelStr.includes('error')) level = 'error';
        else if (levelStr.includes('warn')) level = 'warn';
        else if (levelStr.includes('debug')) level = 'debug';
      } else if (log['@message']?.toLowerCase().includes('error')) {
        level = 'error';
      } else if (log['@message']?.toLowerCase().includes('warn')) {
        level = 'warn';
      }

      return selectedLevels.has(level);
    });
  }, [displayData, selectedLevels]);

  // Получаем данные для диаграммы Ганта
  const ganttData = useGanttData(ganttLogs);

  // Группировка по цепочкам запросов
  const requestChains = useMemo(() => {
    const chains: Record<string, RequestChainType> = {};
    
    displayData.forEach(entry => {
      if (entry.tf_req_id) {
        if (!chains[entry.tf_req_id]) {
          chains[entry.tf_req_id] = {
            reqId: entry.tf_req_id,
            entries: []
          };
        }
        chains[entry.tf_req_id].entries.push(entry);
      }
    });

    return Object.values(chains);
  }, [displayData]);

  // Обработчик клика по элементу Ганта
  const handleGanttItemClick = useCallback((item: GanttItem) => {
    // Можно добавить логику для навигации к конкретному логу
    console.log('Gantt item clicked:', item);
  }, []);

  // Переключение уровней для фильтрации Ганта
  const handleLevelToggle = useCallback((level: string) => {
    setSelectedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  }, []);

  // Статистика для отображения
  const stats = useMemo(() => ({
    all: logData.length,
    search: searchResults.length,
    filtered: filteredData.length,
    chains: requestChains.length,
    ganttChains: ganttData.length
  }), [logData.length, searchResults.length, filteredData.length, requestChains.length, ganttData.length]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terraform Log Viewer</h1>
          
          {/* Вкладки */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Все записи ({stats.all})
            </button>
            <button
              onClick={() => handleTabChange('search')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'search' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Результаты поиска ({stats.search})
            </button>
            <button
              onClick={() => handleTabChange('filtered')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'filtered' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Фильтры ({stats.filtered}) {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
            <button
              onClick={() => handleTabChange('gantt')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'gantt' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Диаграмма Ганта ({stats.ganttChains})
            </button>
          </div>

          {/* Режимы отображения (только для вкладок с логами) */}
          {activeTab !== 'gantt' && (
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'single' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Отдельные записи
              </button>
              <button
                onClick={() => setViewMode('chains')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'chains' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Группировать по запросам ({stats.chains})
              </button>
            </div>
          )}

          {/* Фильтры уровней для диаграммы Ганта */}
          {activeTab === 'gantt' && (
            <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Уровни логов:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'info', label: 'Info', color: 'bg-blue-500' },
                    { key: 'warn', label: 'Warning', color: 'bg-yellow-500' },
                    { key: 'error', label: 'Error', color: 'bg-red-500' },
                    { key: 'debug', label: 'Debug', color: 'bg-gray-500' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      onClick={() => handleLevelToggle(key)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-all
                        ${selectedLevels.has(key)
                          ? `${color} text-white shadow-sm`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  Показано: {ganttLogs.length} записей из {displayData.length}
                </div>
              </div>
            </div>
          )}

          {/* Кнопка сброса */}
          {(activeTab === 'search' || activeTab === 'filtered') && (
            <div className="mb-4">
              <button
                onClick={handleClearAll}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Сбросить все фильтры и поиск
              </button>
            </div>
          )}
        </div>

        {/* Панели поиска и фильтров (скрываем для диаграммы Ганта) */}
        {activeTab !== 'gantt' && (
          <div className="space-y-4 mb-6">
            <SearchPanel
              onSearch={handleSearch}
              onClear={clearSearch}
            />
            <FilterPanel
              onFilter={handleFilter}
              onClear={clearFilters}
            />
          </div>
        )}

        {/* Отображение данных */}
        <div className="bg-white rounded-lg border shadow-sm">
          {activeTab === 'gantt' ? (
            // Диаграмма Ганта
            <div className="p-4">
              {ganttData.length > 0 ? (
                <GanttChart 
                  data={ganttData} 
                  height={600}
                  onItemClick={handleGanttItemClick}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {displayData.length === 0 
                    ? 'Нет данных для отображения'
                    : 'Нет записей с tf_req_id для построения диаграммы Ганта'
                  }
                </div>
              )}
            </div>
          ) : viewMode === 'chains' ? (
            // Группировка по цепочкам запросов
            <div className="p-4">
              {requestChains.length > 0 ? (
                requestChains.map(chain => (
                  <div key={chain.reqId} className="mb-6 border-2 border-green-200 rounded-lg">
                    <div className="bg-green-50 p-3 border-b border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">Цепочка запроса</span>
                          <span className="text-sm font-mono bg-green-100 px-2 py-1 rounded">
                            {chain.reqId}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {chain.entries.length} записей
                        </span>
                      </div>
                    </div>
                    <div className="divide-y">
                      {chain.entries.map(entry => (
                        <LogEntryComponent
                          key={entry.id}
                          entry={entry}
                          isRead={entry.id ? readEntries.has(entry.id) : false}
                          onMarkRead={markAsRead}
                          showRequestChain={true}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Нет цепочек запросов для отображения
                </div>
              )}
            </div>
          ) : (
            // Отдельные записи
            <div className="p-4">
              {displayData.length > 0 ? (
                displayData.map(entry => (
                  <LogEntryComponent
                    key={entry.id}
                    entry={entry}
                    isRead={entry.id ? readEntries.has(entry.id) : false}
                    onMarkRead={markAsRead}
                    showRequestChain={false}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {activeTab === 'search' 
                    ? 'Нет результатов поиска' 
                    : activeTab === 'filtered'
                    ? 'Нет записей, соответствующих фильтрам'
                    : 'Нет данных для отображения'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}