import React, { useState } from 'react';
import { JSONViewer } from '../JSONViewer/JSONViewer';
import type { LogEntry as LogEntryType } from '../../types/log.types';
import { ChevronIcon } from '../UI/icons';
import { clsx } from 'clsx';

interface LogEntryProps {
  entry: LogEntryType;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  showRequestChain?: boolean;
  isHighlighted?: boolean;
}

export const LogEntryComponent: React.FC<LogEntryProps> = ({
  entry,
  isRead,
  onMarkRead,
  showRequestChain = false,
  isHighlighted = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getLevelStyles = (level: string) => {
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-800',
      warn: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      debug: 'bg-gray-50 border-gray-200 text-gray-800',
      trace: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return styles[level as keyof typeof styles] || styles.info;
  };

  const getLevelBadgeStyle = (level: string) => {
    const styles = {
      error: 'bg-red-500 text-white',
      warn: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white',
      debug: 'bg-gray-500 text-white',
      trace: 'bg-purple-500 text-white'
    };
    return styles[level as keyof typeof styles] || styles.info;
  };

  const hasHTTPData = entry.tf_http_req_body || entry.tf_http_res_body;
  const hasRequestId = entry.tf_req_id;

  return (
    <div className={clsx(
      'border rounded-lg mb-3 transition-all duration-200',
      isRead && 'opacity-60 bg-gray-50',
      isHighlighted && 'ring-2 ring-blue-400 shadow-md',
      !isRead && !isHighlighted && 'bg-white hover:shadow-sm'
    )}>
      {/* Header */}
      <div 
        className={clsx(
          'flex items-start justify-between p-4 cursor-pointer border-b transition-colors',
          getLevelStyles(entry['@level']),
          'hover:brightness-95'
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
            <span className={clsx(
              'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
              getLevelBadgeStyle(entry['@level'])
            )}>
              {entry['@level'].toUpperCase()}
            </span>
            
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {formatTimestamp(entry['@timestamp'])}
            </span>
            
            {hasRequestId && showRequestChain && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs whitespace-nowrap">
                Req: {entry.tf_req_id?.slice(0, 8)}...
              </span>
            )}
            
            {entry.tf_rpc && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs whitespace-nowrap">
                {entry.tf_rpc}
              </span>
            )}

            {entry.tf_resource_type && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs whitespace-nowrap">
                {entry.tf_resource_type}
              </span>
            )}
          </div>
          
          <p className="text-sm font-mono break-words">{entry['@message']}</p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(entry.id);
            }}
            className={clsx(
              'text-xs px-2 py-1 rounded border transition-colors',
              isRead 
                ? 'bg-gray-200 text-gray-600 border-gray-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            )}
          >
            {isRead ? '✓ Прочитано' : 'Пометить'}
          </button>
          
          <ChevronIcon isExpanded={showDetails} />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {entry['@module'] && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Module:</span>
                <span className="text-gray-900 font-mono">{entry['@module']}</span>
              </div>
            )}
            
            {entry.tf_provider_addr && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Provider:</span>
                <span className="text-gray-900 font-mono">{entry.tf_provider_addr}</span>
              </div>
            )}
            
            {entry.tf_req_duration_ms !== undefined && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-900">{entry.tf_req_duration_ms}ms</span>
              </div>
            )}

            {entry['@caller'] && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">Caller:</span>
                <span className="text-gray-900 font-mono text-xs">{entry['@caller']}</span>
              </div>
            )}
          </div>

          {/* HTTP Data */}
          {hasHTTPData && (
            <div className="space-y-3">
              {entry.tf_http_req_body && (
                <JSONViewer
                  data={entry.tf_http_req_body}
                  title={`📤 HTTP Request ${entry.tf_http_req_method ? `(${entry.tf_http_req_method})` : ''}`}
                  collapsed={true}
                />
              )}
              
              {entry.tf_http_res_body && (
                <JSONViewer
                  data={entry.tf_http_res_body}
                  title={`📥 HTTP Response ${entry.tf_http_res_status_code ? `(${entry.tf_http_res_status_code})` : ''}`}
                  collapsed={true}
                />
              )}
            </div>
          )}

          {/* All Fields */}
          <div className="border rounded-lg">
            <details className="group">
              <summary className="cursor-pointer font-medium text-sm text-gray-700 hover:text-gray-900 p-3 bg-gray-50 rounded-lg list-none">
                <div className="flex items-center justify-between">
                  <span>Все поля ({Object.keys(entry).length})</span>
                  <ChevronIcon isExpanded={false} />
                </div>
              </summary>
              
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(entry, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  } catch {
    return timestamp;
  }
};