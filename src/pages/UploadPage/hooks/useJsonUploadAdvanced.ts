import { useState, useCallback } from 'react';
import { baseApiClient } from '../../../api/baseClient';
import type { ApiError } from '../../../api/baseClient';
import type { LogEntry } from '@/types/log.types';

export interface UploadedFileInfo {
  id: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  totalEntries: number;
  status: 'success' | 'error';
}

interface UploadState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  fileInfo: UploadedFileInfo | null;
}

interface UseJsonUploadAdvancedReturn extends UploadState {
  uploadFile: (file: File) => Promise<UploadedFileInfo>;
  fetchUploadedLogs: (fileId: string) => Promise<LogEntry[]>;
  reset: () => void;
}

export const useJsonUploadAdvanced = (): UseJsonUploadAdvancedReturn => {
  const [state, setState] = useState<UploadState>({
    isLoading: false,
    progress: 0,
    error: null,
    fileInfo: null,
  });

  // Загрузка файла на сервер
  const uploadFile = useCallback(async (file: File): Promise<UploadedFileInfo> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      fileInfo: null,
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('originalName', file.name);
      formData.append('size', file.size.toString());

      const response = await baseApiClient.upload<UploadedFileInfo>(
        '/logs/upload',
        formData,
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setState(prev => ({ ...prev, progress }));
          }
        }
      );

      const fileInfo = response.data;
      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        fileInfo,
      }));

      return fileInfo;

    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Ошибка при загрузке файла',
        progress: 0,
      }));
      throw error;
    }
  }, []);

  // Получение загруженных логов
  const fetchUploadedLogs = useCallback(async (fileId: string): Promise<LogEntry[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await baseApiClient.get<{ logs: LogEntry[] }>(
        `/logs/file/${fileId}`
      );

      setState(prev => ({ ...prev, isLoading: false }));
      return response.data.logs;

    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Ошибка при получении логов',
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      fileInfo: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    fetchUploadedLogs,
    reset,
  };
};