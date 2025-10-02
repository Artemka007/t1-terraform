import { useState, useEffect } from 'react';
import type { PluginInfo } from '../types/plugin.types';
import { pluginAPI } from '../api';

export const usePlugins = () => {
  const [plugins, setPlugins] = useState<Record<string, PluginInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      const pluginsData = await pluginAPI.getPlugins();
      setPlugins(pluginsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load plugins';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  return {
    plugins,
    loading,
    error,
    refetch: loadPlugins,
  };
};