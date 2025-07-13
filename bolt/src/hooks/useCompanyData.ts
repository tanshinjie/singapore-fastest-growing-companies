import { useState, useEffect } from 'react';
import { Company, CompanyHistoricalData, FilterState } from '../types/Company';
import { getAllSectors, getFoundingYearRange, getCompanyHistoricalData, getRecurringCompanies } from '../utils/dataProcessing';

export const useCompanyData = () => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [historicalData, setHistoricalData] = useState<CompanyHistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    selectedYears: [],
    selectedSectors: [],
    foundingYearRange: [1800, 2025],
    topN: 25,
    searchTerm: ''
  });

  const loadCompanyData = (companies: Company[]) => {
    try {
      setLoading(true);
      setAllCompanies(companies);
      
      const historical = getCompanyHistoricalData(companies);
      setHistoricalData(historical);

      // Initialize filters with available data
      const sectors = getAllSectors(companies);
      const [minYear, maxYear] = getFoundingYearRange(companies);
      const availableYears = [...new Set(companies.map(c => c.year))].sort();
      
      setFilters(prev => ({
        ...prev,
        selectedYears: availableYears,
        selectedSectors: sectors,
        foundingYearRange: [minYear, maxYear],
        searchTerm: ''
      }));
      
      setHasData(true);
      setError(null);
    } catch (err) {
      setError('Failed to process company data');
      console.error('Error processing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setAllCompanies([]);
    setHistoricalData([]);
    setHasData(false);
    setFilters({
      selectedYears: [],
      selectedSectors: [],
      foundingYearRange: [1800, 2025],
      topN: 25,
      searchTerm: ''
    });
  };

  const filteredCompanies = allCompanies.filter(company => {
    // Search filter
    if (filters.searchTerm && !company.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Year filter
    if (!filters.selectedYears.includes(company.year)) return false;
    
    // Sector filter
    if (filters.selectedSectors.length > 0 && !filters.selectedSectors.includes(company.sector)) return false;
    
    // Founding year filter
    if (company.foundingYear < filters.foundingYearRange[0] || 
        company.foundingYear > filters.foundingYearRange[1]) return false;
    
    return true;
  });

  const topCompanies = filteredCompanies
    .sort((a, b) => b.absoluteGrowthRate - a.absoluteGrowthRate)
    .slice(0, filters.topN === 999 ? filteredCompanies.length : filters.topN);

  const recurringCompanies = getRecurringCompanies(filteredCompanies);

  const availableYears = [...new Set(allCompanies.map(c => c.year))].sort();
  const availableSectors = getAllSectors(allCompanies);
  const foundingYearRange = getFoundingYearRange(allCompanies);

  return {
    allCompanies,
    filteredCompanies,
    topCompanies,
    recurringCompanies,
    historicalData,
    filters,
    setFilters,
    availableYears,
    availableSectors,
    foundingYearRange,
    loading,
    error,
    hasData,
    loadCompanyData,
    clearData
  };
};