import { useState, useEffect } from 'react';
import { pluginAPI } from '../api';

export const useFiles = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const filesData = await pluginAPI.getAvailableFiles();
      setFiles(filesData.map(i => (i as any).name));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load files';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return {
    files,
    loading,
    error,
    refetch: loadFiles,
  };
};