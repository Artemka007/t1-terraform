import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 2000
}

// Типы для ошибок API
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Конфигурация базового клиента
class BaseApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Интерцепторы для запросов и ответов
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Добавляем токен авторизации, если есть
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Логируем запросы в development
        if (import.meta.env.DEV) {
          console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        }

        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Логируем успешные ответы в development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
        }

        return response;
      },
      (error) => {
        const normalizedError = this.normalizeError(error);
        
        // Логируем ошибки
        console.error('❌ API Response Error:', normalizedError);

        // Обрабатываем специфичные статусы
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(normalizedError);
      }
    );
  }

  // Нормализация ошибок
  private normalizeError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || 'Network Error',
        code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
        status: error.response?.status || 0,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      message: error?.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
      timestamp: new Date().toISOString(),
    };
  }

  // Получение токена авторизации (можно переопределить)
  protected getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Обработка 401 ошибки
  private handleUnauthorized(): void {
    // Очищаем токен и перенаправляем на страницу логина
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Базовые HTTP методы
  public async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  public async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // Метод для загрузки файлов
  public async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return {
      data: response.data,
      status: response.status,
    };
  }

  // Установка базового URL
  public setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
    this.baseURL = baseURL;
  }

  // Получение текущего экземпляра axios (для кастомных случаев)
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const baseApiClient = new BaseApiClient();
export default BaseApiClient;