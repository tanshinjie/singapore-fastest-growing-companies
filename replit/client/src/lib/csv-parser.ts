import Papa from 'papaparse';
import { Company } from '@shared/schema';

export interface RawCompanyData {
  Rank: string;
  Name: string;
  Sector: string;
  'Absolute growth rate': string;
  'Compound annual growth rate (CAGR)': string;
  'Revenue 2023': string;
  'Revenue 2020': string;
  'Number of employees 2023': string;
  'Number of employees 2020': string;
  'Founding year': string;
  Website: string;
}

export async function parseCSVFile(file: string, year: number): Promise<Company[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const companies: Company[] = results.data.map((row: any, index: number) => {
            // Handle different column names across years
            const rank = parseInt(row['Rank'] || row['rank'] || '0');
            const name = row['Name'] || row['name'] || '';
            const sector = row['Sector'] || row['sector'] || '';
            
            // Parse growth rates - handle different column formats
            const absoluteGrowthRate = parseFloat(
              row['Absolute growth rate'] || 
              row['absolute growth rate'] || 
              row['Absolute growth rate (in %)'] || 
              '0'
            );
            
            const cagr = parseFloat(
              row['Compound annual growth rate (CAGR)'] || 
              row['Compound annual growth rate'] || 
              row['Compound annual growth rate (CAGR) (in %)'] || 
              '0'
            );
            
            // Parse revenue data - handle different year columns and formats
            let revenueLatest = 0;
            let revenueBase = 0;
            
            // Try different revenue column patterns
            const revenueColumns = Object.keys(row).filter(key => 
              key.toLowerCase().includes('revenue') && 
              /\d{4}/.test(key) // Contains a year
            );
            
            if (revenueColumns.length >= 2) {
              // Sort by year to get latest and base
              const sortedRevenue = revenueColumns.sort((a, b) => {
                const yearA = parseInt(a.match(/\d{4}/)?.[0] || '0');
                const yearB = parseInt(b.match(/\d{4}/)?.[0] || '0');
                return yearB - yearA; // Descending order
              });
              
              revenueLatest = parseFloat(row[sortedRevenue[0]] || '0');
              revenueBase = parseFloat(row[sortedRevenue[sortedRevenue.length - 1]] || '0');
            }
            
            // Parse employee data - handle different formats
            let employeesLatest = 0;
            let employeesBase = 0;
            
            const employeeColumns = Object.keys(row).filter(key => 
              key.toLowerCase().includes('employees') && 
              /\d{4}/.test(key)
            );
            
            if (employeeColumns.length >= 2) {
              const sortedEmployees = employeeColumns.sort((a, b) => {
                const yearA = parseInt(a.match(/\d{4}/)?.[0] || '0');
                const yearB = parseInt(b.match(/\d{4}/)?.[0] || '0');
                return yearB - yearA;
              });
              
              employeesLatest = parseInt(row[sortedEmployees[0]] || '0');
              employeesBase = parseInt(row[sortedEmployees[sortedEmployees.length - 1]] || '0');
            }
            
            const foundingYear = parseInt(row['Founding year'] || '0');
            const website = row['Website'] || row['website'] || '';

            return {
              rank,
              name,
              sector,
              absoluteGrowthRate,
              cagr,
              revenueLatest,
              revenueBase,
              employeesLatest,
              employeesBase,
              foundingYear,
              website: website || undefined,
              year,
            };
          });

          // Filter out invalid entries but keep all valid ones
          const validCompanies = companies.filter(company => 
            company.name && 
            company.name.trim() !== '' && 
            company.rank > 0
          );

          console.log(`Parsed ${validCompanies.length} companies from ${results.data.length} rows for year ${year}`);
          resolve(validCompanies);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function loadCSVData(): Promise<Company[]> {
  const years = [2023, 2024, 2025];
  const allCompanies: Company[] = [];

  for (const year of years) {
    try {
      const response = await fetch(`/data/${year}_standardized.csv`);
      if (!response.ok) {
        throw new Error(`Failed to load ${year} data: ${response.statusText}`);
      }
      const csvText = await response.text();
      const companies = await parseCSVFile(csvText, year);
      allCompanies.push(...companies);
    } catch (error) {
      console.error(`Error loading ${year} data:`, error);
    }
  }

  return allCompanies;
}
