import React from 'react';
import type { Finding } from '../../types/plugin.types';

interface SeverityBadgeProps {
  severity: Finding['severity'];
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const severityClasses = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityClasses[severity]}`}
    >
      {severity}
    </span>
  );
};