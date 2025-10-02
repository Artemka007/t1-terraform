import React from 'react';
import type { Finding, AnalysisResponse } from '../../types/plugin.types';
import { Card } from '../UI/Card';
import { SeverityBadge } from '../UI/SeverityBadge';
import { Button } from '../UI/Button';

interface ResultsPanelProps {
  results: AnalysisResponse | null;
  onClear: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onClear }) => {
  if (!results) {
    return (
      <Card title="Analysis Results">
        <div className="text-center py-8 text-gray-500">
          No analysis results yet. Run analysis to see findings.
        </div>
      </Card>
    );
  }

  const { findings, metrics, total_findings, plugins_used } = results.results;

  const findingsBySeverity = findings.reduce((acc: Record<string, Array<Finding & { plugin: string }>>, finding) => {
    if (!acc[finding.severity]) acc[finding.severity] = [];
    acc[finding.severity].push(finding);
    return acc;
  }, {});

  return (
    <Card title="Analysis Results">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Results</h2>
          <p className="text-gray-600">
            {total_findings} findings from {plugins_used.length} plugin(s)
          </p>
        </div>
        <Button onClick={onClear} variant="secondary">
          Clear Results
        </Button>
      </div>

      {/* Summary Metrics */}
      {Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(metrics).map(([plugin, pluginMetrics], id) => (
            <div key={id} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{plugin}</h4>
              {Object.entries(pluginMetrics).map(([key, value], id) => (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Findings by Severity */}
      {Object.entries(findingsBySeverity)
        .sort(([a], [b]) => {
          const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return severityOrder[a as keyof typeof severityOrder] - severityOrder[b as keyof typeof severityOrder];
        })
        .map(([severity, severityFindings]) => (
          <div key={severity} className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <SeverityBadge severity={severity as Finding['severity']} />
              <span className="text-sm text-gray-600">
                {severityFindings.length} finding(s)
              </span>
            </div>

            <div className="space-y-3">
              {severityFindings.map((finding, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{finding.message}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Plugin: {finding.plugin}</span>
                        <span>Type: {finding.type}</span>
                        {finding.resource && finding.resource !== 'unknown' && (
                          <span>Resource: {finding.resource}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {finding.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {finding.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {finding.metadata && Object.keys(finding.metadata).length > 0 && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(finding.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </Card>
  );
};