import React, { useState } from "react";
import { useCompanyData } from "./hooks/useCompanyData";
import { FilterPanel } from "./components/FilterPanel";
import { FileUpload } from "./components/FileUpload";
import { TopCompaniesChart } from "./components/charts/TopCompaniesChart";
import { RevenueEmployeesScatter } from "./components/charts/RevenueEmployeesScatter";
import { SectorDistribution } from "./components/charts/SectorDistribution";
import { RecurringCompaniesTable } from "./components/RecurringCompaniesTable";
import { CompanyDetailPanel } from "./components/CompanyDetailPanel";
import { CompanyTable } from "./components/CompanyTable";
import { exportToCSV } from "./utils/dataProcessing";
import { CompanyHistoricalData } from "./types/Company";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Loader2,
  Upload,
  RefreshCw,
} from "lucide-react";

function App() {
  const {
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
    clearData,
  } = useCompanyData();

  const [selectedCompany, setSelectedCompany] =
    useState<CompanyHistoricalData | null>(null);
  const [chartMetric, setChartMetric] = useState<"absoluteGrowthRate" | "cagr">(
    "absoluteGrowthRate"
  );
  const [showUpload, setShowUpload] = useState(!hasData);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCompanyClick = (companyName: string) => {
    const company = historicalData.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase()
    );
    if (company) {
      setSelectedCompany(company);
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(filteredCompanies, `company_growth_data_${timestamp}.csv`);
  };

  const handleDataLoaded = (companies: any[]) => {
    loadCompanyData(companies);
    setShowUpload(false);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, searchTerm: term });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  // Show upload screen if no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Singapore Fast-Growing Companies Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Upload your CSV files to get started
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your CSV files to start exploring company growth data
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload CSV Files
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-3">⚠️</div>
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {showUpload && (
          <FileUpload
            onDataLoaded={handleDataLoaded}
            onClose={() => setShowUpload(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Singapore Fast-Growing Companies Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive analysis of company growth data
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload More
              </button>
              <button
                onClick={clearData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableYears={availableYears}
                availableSectors={availableSectors}
                foundingYearRange={foundingYearRange}
                onExport={handleExport}
                totalCompanies={allCompanies.length}
                filteredCompanies={filteredCompanies.length}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredCompanies.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Recurring Companies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recurringCompanies.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unique Sectors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {availableSectors.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Controls */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Chart Metric:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartMetric("absoluteGrowthRate")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      chartMetric === "absoluteGrowthRate"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Absolute Growth Rate
                  </button>
                  <button
                    onClick={() => setChartMetric("cagr")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      chartMetric === "cagr"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    CAGR
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="space-y-8">
              {/* Top Companies Chart - Full Width */}
              <TopCompaniesChart
                companies={topCompanies}
                onCompanyClick={handleCompanyClick}
                metric={chartMetric}
              />

              {/* Revenue vs Employees Chart - Full Width */}
              <RevenueEmployeesScatter
                companies={filteredCompanies}
                onCompanyClick={handleCompanyClick}
              />

              {/* Sector Distribution Chart - Full Width */}
              <SectorDistribution companies={filteredCompanies} />
            </div>

            {/* Recurring Companies Table */}
            {recurringCompanies.length > 0 && (
              <RecurringCompaniesTable
                companies={recurringCompanies}
                onCompanyClick={handleCompanyClick}
              />
            )}

            {/* Company Table - Show when searching */}
            {searchTerm && (
              <CompanyTable
                companies={filteredCompanies.slice(0, 100)} // Limit to 100 for performance
                onCompanyClick={handleCompanyClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Company Detail Modal */}
      <CompanyDetailPanel
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />

      {/* Upload Modal */}
      {showUpload && (
        <FileUpload
          onDataLoaded={handleDataLoaded}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

export default App;
