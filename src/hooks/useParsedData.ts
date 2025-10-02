import { useCallback, useState } from "react";
import type { ParserResult } from "../pages/ParserAnalysisPage/types";
import { baseApiClient, type ApiError } from "@/api/baseClient";

type Data = {
  isLoading: boolean;
  error?: string | null;
  result?: ParserResult;
}

export const useParsedData = () => {
  const [results, setResults] = useState<Data>();

  const fetchResults = useCallback(async (fileId: string): Promise<ParserResult> => {
      setResults(prev => ({ ...prev, isLoading: true, error: null }));
  
      try {
        const response = await baseApiClient.get<ParserResult>(
          `/sections/file/${fileId}`
        );

        setResults(prev => ({ ...prev, result: response.data, isLoading: false }));
        return response.data;
  
      } catch (error) {
        const apiError = error as ApiError;
        setResults(prev => ({
          ...prev,
          isLoading: false,
          error: apiError.message || 'Ошибка при получении логов',
        }));
        throw error;
      }
    }, []);

    return {
      results,
      fetchResults
    };
};