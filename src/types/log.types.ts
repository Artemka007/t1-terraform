export interface LogEntry {
  id?: string;
  '@level'?: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  '@message'?: string;
  '@timestamp'?: string;
  '@module'?: string;
  '@caller'?: string;
  tf_req_id?: string;
  tf_rpc?: string;
  tf_provider_addr?: string;
  tf_resource_type?: string;
  tf_data_source_type?: string;
  tf_http_req_body?: string;
  tf_http_res_body?: string;
  tf_http_req_method?: string;
  tf_http_res_status_code?: number;
  tf_req_duration_ms?: number;
  diagnostic_severity?: string;
  [key: string]: any;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: any;
}

export interface SearchConfig {
  query: string;
  fields: string[];
  caseSensitive: boolean;
}

export interface RequestChain {
  reqId: string;
  entries: LogEntry[];
  duration?: number;
  status?: string;
}