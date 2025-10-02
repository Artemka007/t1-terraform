import React, { useState } from 'react';
import { PluginList } from '../../components/LogAnalyzer/PluginList';
import { AnalysisPanel } from '../../components/LogAnalyzer/AnalysisPanel';
import { ResultsPanel } from '../../components/LogAnalyzer/ResultsPanel';
import { usePlugins } from '../../hooks/usePlugins';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useFiles } from '../../hooks/useFiles';
import type { AnalysisRequest } from '../../types/plugin.types';

const PluginManagerPage: React.FC = () => {
  const { plugins, loading: pluginsLoading, error: pluginsError, refetch: refetchPlugins } = usePlugins();
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = useFiles();
  const { analyzing, results, error: analysisError, runAnalysis, clearResults } = useAnalysis();
  
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);

  const handlePluginToggle = (pluginName: string) => {
    setSelectedPlugins(prev =>
      prev.includes(pluginName)
        ? prev.filter(p => p !== pluginName)
        : [...prev, pluginName]
    );
  };

  const handleRunAnalysis = async (request: AnalysisRequest) => {
    await runAnalysis(request);
  };

  const handleRefreshAll = () => {
    refetchPlugins();
    refetchFiles();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Менеджер плагинов Terraform</h1>
              <p className="text-gray-600 mt-2">
                Анализируйте логи Terraform с помощью подключаемых плагинов
              </p>
            </div>
            <button
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              disabled={pluginsLoading || filesLoading}
            >
              Обновить все
            </button>
          </div>
        </header>

        {/* Ошибки */}
        {pluginsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Ошибка плагинов: {pluginsError}</p>
          </div>
        )}

        {filesError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Ошибка загрузки файлов: {filesError}</p>
          </div>
        )}

        {analysisError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Ошибка анализа: {analysisError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Левая колонка - плагины и анализ */}
          <div className="space-y-6">
            <PluginList
              plugins={plugins}
              selectedPlugins={selectedPlugins}
              onPluginToggle={handlePluginToggle}
              onRefresh={refetchPlugins}
              loading={pluginsLoading}
            />
            
            <AnalysisPanel
              selectedPlugins={selectedPlugins}
              availableFiles={files}
              onRunAnalysis={handleRunAnalysis}
              analyzing={analyzing}
              loading={filesLoading}
            />
          </div>

          {/* Правая колонка - результаты */}
          <div>
            <ResultsPanel results={results} onClear={clearResults} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginManagerPage;