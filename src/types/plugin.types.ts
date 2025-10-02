export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  supported_parameters: string[];
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  metadata: Record<string, string>;
}

export interface Finding {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  resource: string;
  recommendations: string[];
  metadata: Record<string, string>;
}

export interface AnalysisResult {
  summary: string;
  processed_count: number;
  finding_count: number;
  severity_level: string;
}

export interface PluginResponse {
  result: AnalysisResult;
  findings: Finding[];
  metrics: Record<string, string>;
}

export interface PluginAnalysis {
  plugin: string;
  findings: Finding[];
  metrics: Record<string, string>;
  result: AnalysisResult;
}

export interface AnalysisRequest {
  filename: string;
  plugins: string[];
  parameters?: Record<string, string>;
}

export interface AnalysisResponse {
  status: string;           // 'success' или 'error'
  plugins_used: string[];   // Список использованных плагинов
  results: {
    findings: Array<Finding & { plugin: string }>;  // Найденные проблемы
    metrics: Record<string, Record<string, string>>; // Метрики по плагинам
    total_findings: number; // Общее количество найденных проблем
    plugins_used: string[] | any;
  };
}