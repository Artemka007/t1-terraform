// src/components/FileUploadPage/FileUploadPage.tsx
import React, { useCallback } from 'react';
import { useJsonUploadAdvanced } from '../../hooks/useJsonUploadAdvanced';
import type { LogEntry } from '@/types/log.types';

interface FileUploadPageProps {
  onLogsLoaded: (logs: LogEntry[], fileName: string) => void;
}

export const FileUploadPage: React.FC<FileUploadPageProps> = ({ onLogsLoaded }) => {
  const {
    uploadFile,
    fetchUploadedLogs,
    isLoading,
    progress,
    error,
    fileInfo,
    reset,
  } = useJsonUploadAdvanced();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Загружаем файл на сервер
      const uploadedFileInfo = await uploadFile(file);
      
      // После успешной загрузки сразу получаем логи
      if (uploadedFileInfo.status === 'success') {
        const {logs, fileName} = await fetchUploadedLogs(uploadedFileInfo.id);
        onLogsLoaded(logs, fileName);
      }
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  }, [uploadFile, fetchUploadedLogs, onLogsLoaded]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      return;
    }

    const syntheticEvent = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleFileSelect(syntheticEvent);
  }, [handleFileSelect]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Загрузка логов Terraform
            </h1>
            <p className="text-gray-600">
              Загрузите JSON файл с логами для анализа
            </p>
          </div>

          {/* Область загрузки */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
              ${isLoading ? 'opacity-50' : 'cursor-pointer'}
            `}
          >
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Загрузка файла...</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{progress}%</p>
                  </div>
                  {fileInfo && (
                    <p className="text-sm text-gray-500 mt-1">{fileInfo.fileName}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    Перетащите файл сюда или нажмите для выбора
                  </p>
                  <p className="text-sm text-gray-500">
                    Поддерживается только JSON формат
                  </p>
                </div>

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Выбрать файл
                </label>
              </>
            )}
          </div>

          {/* Информация о загруженном файле */}
          {fileInfo && !isLoading && (
            <div className={`mt-4 p-3 rounded-lg border ${
              fileInfo.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg 
                    className={`w-5 h-5 ${
                      fileInfo.status === 'success' ? 'text-green-500' : 'text-red-500'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {fileInfo.status === 'success' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div>
                    <span className={`font-medium ${
                      fileInfo.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {fileInfo.fileName}
                    </span>
                    <div className={`text-sm ${
                      fileInfo.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fileInfo.status === 'success' 
                        ? `Успешно загружено • ${fileInfo.totalEntries} записей`
                        : 'Ошибка при обработке файла'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Сообщение об ошибке */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Кнопка сброса */}
          {(error || fileInfo) && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Загрузить другой файл
              </button>
            </div>
          )}

          {/* Инструкция */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Требования к файлу:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Формат: JSON</li>
              <li>• Структура: массив объектов логов</li>
              <li>• Обязательные поля: id, @message</li>
              <li>• Поддерживаются стандартные поля Terraform логов</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};