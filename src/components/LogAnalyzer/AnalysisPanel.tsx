import React, { useState } from 'react';
import type { AnalysisRequest } from '../../types/plugin.types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

interface AnalysisPanelProps {
  selectedPlugins: string[];
  availableFiles: string[];
  onRunAnalysis: (request: AnalysisRequest) => void;
  analyzing: boolean;
  loading?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  selectedPlugins,
  availableFiles,
  onRunAnalysis,
  analyzing,
  loading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleRunAnalysis = () => {
    if (!selectedFile || selectedPlugins.length === 0) return;

    onRunAnalysis({
      filename: selectedFile,
      plugins: selectedPlugins,
    });
  };

  const canRunAnalysis = selectedFile && selectedPlugins.length > 0;

  return (
    <Card title="Log Analysis">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Log File
          </label>
          {loading ? (
            <div className="p-3 bg-gray-100 rounded-md animate-pulse">Loading files...</div>
          ) : (
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={availableFiles.length === 0}
            >
              <option value="">Choose a file...</option>
              {availableFiles.map((file, id) => (
                <option key={id} value={file}>
                  {file}
                </option>
              ))}
            </select>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {availableFiles.length} file(s) available on server
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Plugins ({selectedPlugins.length})
          </label>
          <div className="p-3 bg-gray-50 rounded-md min-h-[40px]">
            {selectedPlugins.length === 0 ? (
              <p className="text-gray-500 text-sm">No plugins selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedPlugins.map((plugin) => (
                  <span
                    key={plugin}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                  >
                    {plugin}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleRunAnalysis}
          disabled={!canRunAnalysis || analyzing || loading}
          loading={analyzing}
          variant="primary"
        >
          Run Analysis
        </Button>

        {!canRunAnalysis && (
          <p className="text-sm text-orange-600">
            {!selectedFile && 'Please select a log file. '}
            {selectedPlugins.length === 0 && 'Please select at least one plugin.'}
          </p>
        )}
      </div>
    </Card>
  );
};