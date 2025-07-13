import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Company } from '@shared/schema';
import { loadCSVData } from '@/lib/csv-parser';

export function useCSVData() {
  const {
    data: companies = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['companies'],
    queryFn: loadCSVData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  return {
    companies,
    isLoading,
    error,
    refetch
  };
}
