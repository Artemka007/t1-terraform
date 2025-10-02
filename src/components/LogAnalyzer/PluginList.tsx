import React from 'react';
import type { PluginInfo } from '../../types/plugin.types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

interface PluginListProps {
  plugins: Record<string, PluginInfo>;
  selectedPlugins: string[];
  onPluginToggle: (pluginName: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const PluginList: React.FC<PluginListProps> = ({
  plugins,
  selectedPlugins,
  onPluginToggle,
  onRefresh,
  loading,
}) => {
  return (
    <Card title="Available Plugins">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Plugin Manager</h2>
        <Button onClick={onRefresh} loading={loading} variant="secondary">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(plugins).map(([name, plugin]) => (
          <div
            key={name}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPlugins.includes(name)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onPluginToggle(name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPlugins.includes(name)}
                    onChange={() => onPluginToggle(name)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {plugin.name} <span className="text-sm text-gray-500">v{plugin.version}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plugin.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedPlugins.includes(name) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>
        ))}

        {Object.keys(plugins).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No plugins available. Make sure plugins are running.
          </div>
        )}
      </div>

      {selectedPlugins.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedPlugins.length}</strong> plugin(s) selected for analysis
          </p>
        </div>
      )}
    </Card>
  );
};