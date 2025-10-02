import type { AxiosResponse } from 'axios';
import { baseApiClient } from './baseClient';
import type {
  PluginInfo,
  AnalysisRequest,
  AnalysisResponse,
} from '../types/plugin.types';

export const pluginAPI = {
  // Получить список доступных плагинов
  async getPlugins(): Promise<Record<string, PluginInfo>> {
    const response = await baseApiClient.get('/plugins');
    return response.data.plugins;
  },

  // Запустить анализ с выбранными плагинами
  async analyzeWithPlugins(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('filename', request.filename);
    formData.append('plugins', request.plugins.join(','));

    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        formData.append(`param_${key}`, value);
      });
    }

    const response = await baseApiClient.post(
      '/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  // Получить список доступных файлов логов
  async getAvailableFiles(): Promise<string[]> {
    const response = await baseApiClient.get('/files');
    return response.data.files;
  },

  // Загрузить новый файл лога (если нужно)
  async uploadLogFile(file: File): Promise<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await baseApiClient.post<{ filename: string }>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};