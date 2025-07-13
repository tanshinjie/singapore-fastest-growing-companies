export interface Company {
  rank: number;
  name: string;
  website: string;
  sector: string;
  absoluteGrowthRate: number;
  cagr: number;
  revenue2018?: number;
  revenue2015?: number;
  employees2018?: number;
  employees2015?: number;
  foundingYear: number;
  year: number; // Added to track which year this data is from
}

export interface CompanyHistoricalData {
  name: string;
  website: string;
  sector: string;
  foundingYear: number;
  yearlyData: Array<{
    year: number;
    rank: number;
    absoluteGrowthRate: number;
    cagr: number;
    revenue2018?: number;
    revenue2015?: number;
    employees2018?: number;
    employees2015?: number;
  }>;
}

export interface FilterState {
  selectedYears: number[];
  selectedSectors: string[];
  foundingYearRange: [number, number];
  topN: number;
  searchTerm: string;
}