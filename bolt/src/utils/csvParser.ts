import Papa from 'papaparse';
import { Company } from '../types/Company';

export const parseCSVData = (csvText: string, year: number): Company[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Normalize headers to handle variations
      const headerMap: { [key: string]: string } = {
        'Rank': 'rank',
        'Name': 'name',
        'Website': 'website',
        'Sector': 'sector',
        'Absolute growth rate (in %)': 'absoluteGrowthRate',
        'Absolute growth rate': 'absoluteGrowthRate',
        'Compound annual growth rate (CAGR) (in %)': 'cagr',
        'Compound annual growth rate (CAGR)': 'cagr',
        'Compound annual growth rate': 'cagr',
        'Revenue 2018 (in SGD)': 'revenue2018',
        'Revenue 2019': 'revenue2018',
        'Revenue 2020': 'revenue2018',
        'Revenue 2021': 'revenue2018',
        'Revenue 2022': 'revenue2018',
        'Revenue 2015 (in SGD)': 'revenue2015',
        'Revenue 2016': 'revenue2015',
        'Revenue 2017': 'revenue2015',
        'Revenue 2018': 'revenue2015',
        'Revenue 2019': 'revenue2015',
        'Number of employees 2018': 'employees2018',
        'Number of employees 2019': 'employees2018',
        'Number of employees 2020': 'employees2018',
        'Number of employees 2021': 'employees2018',
        'Number of employees 2022': 'employees2018',
        'Number of employees in 2022': 'employees2018',
        'Number of employees 2015': 'employees2015',
        'Number of employees 2016': 'employees2015',
        'Number of employees 2017': 'employees2015',
        'Number of employees 2018': 'employees2015',
        'Number of employees 2019': 'employees2015',
        'Founding year': 'foundingYear'
      };
      
      return headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
    }
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors);
  }

  return result.data.map((row: any) => ({
    rank: parseInt(row.rank) || 0,
    name: row.name || '',
    website: row.website || '',
    sector: row.sector || 'Unknown',
    absoluteGrowthRate: parseFloat(row.absoluteGrowthRate) || 0,
    cagr: parseFloat(row.cagr) || 0,
    revenue2018: row.revenue2018 ? parseFloat(row.revenue2018) : undefined,
    revenue2015: row.revenue2015 ? parseFloat(row.revenue2015) : undefined,
    employees2018: row.employees2018 ? parseInt(row.employees2018) : undefined,
    employees2015: row.employees2015 ? parseInt(row.employees2015) : undefined,
    foundingYear: parseInt(row.foundingYear) || 0,
    year
  })).filter(company => company.name && company.rank > 0);
};

export const loadAllCSVData = async (): Promise<Company[]> => {
  const years = [2020, 2021, 2022, 2023, 2024];
  const allData: Company[] = [];

  for (const year of years) {
    try {
      const response = await fetch(`/data/${year}_standardized.csv`);
      if (response.ok) {
        const csvText = await response.text();
        const yearData = parseCSVData(csvText, year);
        allData.push(...yearData);
      } else {
        console.warn(`Failed to load data for year ${year}`);
      }
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
    }
  }

  return allData;
};