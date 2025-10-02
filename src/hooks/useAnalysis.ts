import { useState } from 'react';
import type { AnalysisRequest, AnalysisResponse } from '../types/plugin.types';
import { pluginAPI } from '../api';


export const useAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (request: AnalysisRequest) => {
    try {
      setAnalyzing(true);
      setError(null);
      const analysisResults = await pluginAPI.analyzeWithPlugins(request);
      setResults(analysisResults);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Analysis failed';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    analyzing,
    results,
    error,
    runAnalysis,
    clearResults,
  };
};