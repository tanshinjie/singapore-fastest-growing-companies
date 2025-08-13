#!/usr/bin/env node

/**
 * Script to standardize Singapore fastest-growing companies datasets.
 * Creates consistent column names, ordering, and data formatting across all years.
 */

const fs = require('fs');
const path = require('path');

function cleanNumericValue(value) {
    if (value === null || value === undefined || value === '' || value === 'nan') {
        return null;
    }
    
    // Convert to string if not already
    let valueStr = String(value).trim();
    
    // Remove commas and other formatting
    valueStr = valueStr.replace(/[,\s]/g, '');
    
    // Handle percentage signs
    if (valueStr.endsWith('%')) {
        valueStr = valueStr.slice(0, -1);
    }
    
    // Convert to number
    const num = parseFloat(valueStr);
    return isNaN(num) ? null : num;
}

function cleanSectorName(sector) {
    if (!sector || sector === '') {
        return '';
    }
    
    // Clean up common variations
    sector = String(sector).trim();
    
    // Remove quotes at the beginning
    sector = sector.replace(/^["']/, '');
    
    // Standardize common sector names
    const sectorMappings = {
        'E-commerce': 'Ecommerce',
        'E-Commerce': 'Ecommerce',
        'Health Care & Life Sciences': 'Healthcare & Life Sciences',
        'Health Care & Life Sciences ': 'Healthcare & Life Sciences',
        'IT & Software': 'Technology',
        'IT & Software ': 'Technology',
        'Fintech, Financial Services & Insurance': 'Fintech',
        'Fintech, Financial Services & Insurance ': 'Fintech',
        'Professional, Scientific & Technical Services': 'Professional Services',
        'Professional, Scientific & Technical Services ': 'Professional Services',
        'Logistics & Transportation': 'Transport',
        'Logistics & Transportation ': 'Transport',
        'Media & Telecommunications': 'Media & Telecoms',
        'Media & Telecommunications ': 'Media & Telecoms',
        'Waste management & recycling': 'Waste Management',
        'Waste Management & Recycling': 'Waste Management',
        'Construction & Engineering': 'Construction',
        'Construction & Engineering ': 'Construction',
        'Energy & Utilities': 'Energy',
        'Energy & Utilities ': 'Energy',
        'Food & Beverages': 'Food & Beverage',
        'Food & Beverages ': 'Food & Beverage',
        'Advertising & Marketing': 'Advertising',
        'Advertising & Marketing ': 'Advertising',
        'Education & Social Services': 'Education',
        'Education & Social Services ': 'Education',
    };
    
    return sectorMappings[sector] || sector;
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                let value = values[index];
                // Remove surrounding quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                row[header] = value;
            });
            data.push(row);
        }
    }
    
    return { headers, data };
}

function arrayToCSV(headers, data) {
    const escapeCellValue = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    
    const headerRow = headers.map(escapeCellValue).join(',');
    const dataRows = data.map(row => 
        headers.map(header => escapeCellValue(row[header] || '')).join(',')
    );
    
    return [headerRow, ...dataRows].join('\n');
}

function standardizeDataset(filePath, year) {
    console.log(`Processing ${year} dataset...`);
    
    // Read the CSV file
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const { headers, data } = parseCSV(csvContent);
    
    // Create a mapping of current columns to standard columns
    const columnMapping = {};
    
    // Map columns based on patterns
    headers.forEach(col => {
        const colLower = col.toLowerCase();
        
        if (colLower.includes('rank')) {
            columnMapping[col] = 'rank';
        } else if (colLower.includes('name') && !colLower.includes('sector')) {
            columnMapping[col] = 'company_name';
        } else if (colLower.includes('website')) {
            columnMapping[col] = 'website';
        } else if (colLower.includes('sector')) {
            columnMapping[col] = 'sector';
        } else if (colLower.includes('absolute') && colLower.includes('growth')) {
            columnMapping[col] = 'absolute_growth_rate';
        } else if ((colLower.includes('compound') || colLower.includes('cagr')) && colLower.includes('growth')) {
            columnMapping[col] = 'compound_annual_growth_rate';
        } else if (colLower.includes('revenue') && (col.includes(String(year-1)) || col.includes(String(year+2)))) {
            columnMapping[col] = 'revenue_end';
        } else if (colLower.includes('revenue')) {
            columnMapping[col] = 'revenue_start';
        } else if (colLower.includes('employee') && (col.includes(String(year-1)) || col.includes(String(year+2)))) {
            columnMapping[col] = 'employees_end';
        } else if (colLower.includes('employee')) {
            columnMapping[col] = 'employees_start';
        } else if (colLower.includes('founding')) {
            columnMapping[col] = 'founding_year';
        }
    });
    
    // Transform data with standardized column names
    const standardizedData = data.map(row => {
        const newRow = {};
        
        // Map existing columns to standard names
        Object.keys(columnMapping).forEach(oldCol => {
            const newCol = columnMapping[oldCol];
            newRow[newCol] = row[oldCol];
        });
        
        // Ensure all required columns exist
        const requiredColumns = [
            'rank', 'company_name', 'website', 'sector', 'absolute_growth_rate',
            'compound_annual_growth_rate', 'revenue_end', 'revenue_start',
            'employees_end', 'employees_start', 'founding_year'
        ];
        
        requiredColumns.forEach(col => {
            if (!(col in newRow)) {
                newRow[col] = null;
            }
        });
        
        // Clean and standardize data
        newRow.rank = cleanNumericValue(newRow.rank);
        newRow.company_name = String(newRow.company_name || '').trim();
        newRow.website = String(newRow.website || '').trim();
        newRow.sector = cleanSectorName(newRow.sector);
        
        // Clean numeric columns
        const numericColumns = [
            'absolute_growth_rate', 'compound_annual_growth_rate',
            'revenue_end', 'revenue_start', 'employees_end',
            'employees_start', 'founding_year'
        ];
        
        numericColumns.forEach(col => {
            newRow[col] = cleanNumericValue(newRow[col]);
        });
        
        // Add dataset metadata
        newRow.dataset_year = year;
        
        // Calculate period information based on dataset year
        const periods = {
            2020: { start: 2015, end: 2018 },
            2021: { start: 2016, end: 2019 },
            2022: { start: 2017, end: 2020 },
            2023: { start: 2018, end: 2021 },
            2024: { start: 2019, end: 2022 },
            2025: { start: 2020, end: 2023 }
        };
        
        if (periods[year]) {
            newRow.period_start = periods[year].start;
            newRow.period_end = periods[year].end;
        }
        
        return newRow;
    });
    
    // Sort by rank
    standardizedData.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    
    return standardizedData;
}

function main() {
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const standardizedDatasets = [];
    
    // Define final column order
    const finalColumns = [
        'dataset_year', 'period_start', 'period_end', 'rank', 'company_name',
        'sector', 'absolute_growth_rate', 'compound_annual_growth_rate',
        'revenue_start', 'revenue_end', 'employees_start', 'employees_end',
        'founding_year', 'website'
    ];
    
    years.forEach(year => {
        const filePath = `${year}_standardized.csv`;
        if (fs.existsSync(filePath)) {
            const standardizedData = standardizeDataset(filePath, year);
            standardizedDatasets.push(...standardizedData);
            
            // Save individual standardized dataset
            const outputFile = `${year}_fully_standardized.csv`;
            const csvContent = arrayToCSV(finalColumns, standardizedData);
            fs.writeFileSync(outputFile, csvContent);
            console.log(`Saved standardized ${year} dataset to ${outputFile}`);
        } else {
            console.log(`Warning: ${filePath} not found`);
        }
    });
    
    // Combine all datasets into one master file
    if (standardizedDatasets.length > 0) {
        const combinedCsvContent = arrayToCSV(finalColumns, standardizedDatasets);
        fs.writeFileSync('singapore_fastest_growing_companies_combined.csv', combinedCsvContent);
        console.log('Saved combined dataset to singapore_fastest_growing_companies_combined.csv');
        
        // Generate summary statistics
        console.log('\n=== STANDARDIZATION SUMMARY ===');
        console.log(`Total companies processed: ${standardizedDatasets.length}`);
        console.log(`Datasets processed: ${years.filter(year => fs.existsSync(`${year}_standardized.csv`)).length}`);
        
        const datasetYears = [...new Set(standardizedDatasets.map(row => row.dataset_year))].sort();
        console.log(`Years covered: ${datasetYears.join(', ')}`);
        
        const sectors = [...new Set(standardizedDatasets.map(row => row.sector).filter(s => s))];
        console.log(`Unique sectors: ${sectors.length}`);
        
        const periodStarts = standardizedDatasets.map(row => row.period_start).filter(p => p);
        const periodEnds = standardizedDatasets.map(row => row.period_end).filter(p => p);
        if (periodStarts.length > 0 && periodEnds.length > 0) {
            console.log(`Period range: ${Math.min(...periodStarts)}-${Math.max(...periodEnds)}`);
        }
        
        // Show sector distribution
        console.log('\n=== SECTOR DISTRIBUTION ===');
        const sectorCounts = {};
        standardizedDatasets.forEach(row => {
            if (row.sector) {
                sectorCounts[row.sector] = (sectorCounts[row.sector] || 0) + 1;
            }
        });
        
        const sortedSectors = Object.entries(sectorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        sortedSectors.forEach(([sector, count]) => {
            console.log(`${sector}: ${count}`);
        });
        
        // Data quality check
        console.log('\n=== DATA QUALITY CHECK ===');
        console.log('Missing values per column:');
        finalColumns.forEach(col => {
            const missing = standardizedDatasets.filter(row => 
                row[col] === null || row[col] === undefined || row[col] === ''
            ).length;
            if (missing > 0) {
                console.log(`${col}: ${missing}`);
            }
        });
    }
}

if (require.main === module) {
    main();
}
