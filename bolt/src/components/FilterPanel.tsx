import React from 'react';
import { FilterState } from '../types/Company';
import { Filter, Download, Search, X } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableYears: number[];
  availableSectors: string[];
  foundingYearRange: [number, number];
  onExport: () => void;
  totalCompanies: number;
  filteredCompanies: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableYears,
  availableSectors,
  foundingYearRange,
  onExport,
  totalCompanies,
  filteredCompanies,
  searchTerm,
  onSearchChange
}) => {
  const handleYearChange = (year: number, checked: boolean) => {
    const newYears = checked
      ? [...filters.selectedYears, year]
      : filters.selectedYears.filter(y => y !== year);
    
    onFiltersChange({ ...filters, selectedYears: newYears });
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked
      ? [...filters.selectedSectors, sector]
      : filters.selectedSectors.filter(s => s !== sector);
    
    onFiltersChange({ ...filters, selectedSectors: newSectors });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
      </div>

      {/* Search */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Search Companies</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Years</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableYears.map(year => (
            <label key={year} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedYears.includes(year)}
                onChange={(e) => handleYearChange(year, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{year}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Top N Companies */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top Companies</h3>
        <select
          value={filters.topN}
          onChange={(e) => onFiltersChange({ ...filters, topN: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>Top 10</option>
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
          <option value={999}>All</option>
        </select>
      </div>

      {/* Founding Year Range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Founding Year</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">From:</span>
            <input
              type="number"
              min={foundingYearRange[0]}
              max={foundingYearRange[1]}
              value={filters.foundingYearRange[0]}
              onChange={(e) => onFiltersChange({
                ...filters,
                foundingYearRange: [parseInt(e.target.value), filters.foundingYearRange[1]]
              })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">To:</span>
            <input
              type="number"
              min={foundingYearRange[0]}
              max={foundingYearRange[1]}
              value={filters.foundingYearRange[1]}
              onChange={(e) => onFiltersChange({
                ...filters,
                foundingYearRange: [filters.foundingYearRange[0], parseInt(e.target.value)]
              })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sector Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Sectors</h3>
          <button
            onClick={() => onFiltersChange({ ...filters, selectedSectors: [] })}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear All
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {availableSectors.map(sector => (
            <label key={sector} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedSectors.includes(sector)}
                onChange={(e) => handleSectorChange(sector, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{sector}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-blue-600">{filteredCompanies}</span> of{' '}
          <span className="font-medium">{totalCompanies}</span> companies
        </p>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
};