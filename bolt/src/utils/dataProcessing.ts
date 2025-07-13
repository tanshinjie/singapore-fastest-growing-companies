import { Company, CompanyHistoricalData } from '../types/Company';

export const getAllSectors = (companies: Company[]): string[] => {
  const sectors = new Set(companies.map(c => c.sector));
  return Array.from(sectors).sort();
};

export const getFoundingYearRange = (companies: Company[]): [number, number] => {
  const years = companies.map(c => c.foundingYear).filter(y => y > 0);
  return [Math.min(...years), Math.max(...years)];
};

export const getCompanyHistoricalData = (companies: Company[]): CompanyHistoricalData[] => {
  const companyMap = new Map<string, CompanyHistoricalData>();

  companies.forEach(company => {
    const key = company.name.toLowerCase().trim();
    
    if (!companyMap.has(key)) {
      companyMap.set(key, {
        name: company.name,
        website: company.website,
        sector: company.sector,
        foundingYear: company.foundingYear,
        yearlyData: []
      });
    }

    const historicalData = companyMap.get(key)!;
    historicalData.yearlyData.push({
      year: company.year,
      rank: company.rank,
      absoluteGrowthRate: company.absoluteGrowthRate,
      cagr: company.cagr,
      revenue2018: company.revenue2018,
      revenue2015: company.revenue2015,
      employees2018: company.employees2018,
      employees2015: company.employees2015
    });
  });

  // Sort yearly data by year
  companyMap.forEach(data => {
    data.yearlyData.sort((a, b) => a.year - b.year);
  });

  return Array.from(companyMap.values());
};

export const getRecurringCompanies = (companies: Company[]): CompanyHistoricalData[] => {
  const historicalData = getCompanyHistoricalData(companies);
  return historicalData.filter(company => company.yearlyData.length > 1);
};

export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const exportToCSV = (data: Company[], filename: string = 'company_data.csv'): void => {
  const headers = [
    'Rank', 'Name', 'Website', 'Sector', 'Year',
    'Absolute Growth Rate (%)', 'CAGR (%)',
    'Revenue (Latest)', 'Revenue (Earlier)', 
    'Employees (Latest)', 'Employees (Earlier)', 
    'Founding Year'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(company => [
      company.rank,
      `"${company.name}"`,
      `"${company.website}"`,
      `"${company.sector}"`,
      company.year,
      company.absoluteGrowthRate,
      company.cagr,
      company.revenue2018 || '',
      company.revenue2015 || '',
      company.employees2018 || '',
      company.employees2015 || '',
      company.foundingYear
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};