import React, { useState } from 'react';
import { JSONView } from '@microlink/react-json-view';
import { ChevronIcon } from '../UI/icons';

interface JSONViewerProps {
  data: string | object;
  title?: string;
  collapsed?: boolean;
  className?: string;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({
  data,
  title = "JSON Data",
  collapsed = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const parseJSON = (jsonString: string | object) => {
    if (typeof jsonString === 'object') return jsonString;
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return { error: 'Invalid JSON', raw: jsonString };
    }
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className={`border rounded-lg ${className}`}>
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={toggleExpand}
      >
        <span className="font-medium text-sm">{title}</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {isExpanded ? 'Свернуть' : 'Развернуть'}
          </span>
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 bg-white max-h-96 overflow-auto">
          <JSONView
            data={parseJSON(data)}
            collapsed={1}
            displayObjectSize={false}
            displayDataTypes={false}
            enableClipboard={true}
            theme="harmonic"
            style={{
              fontSize: '12px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      )}
    </div>
  );
};