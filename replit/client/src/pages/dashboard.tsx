import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, Sun, Moon, Menu } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Charts } from "@/components/dashboard/charts";
import { CompanyTable } from "@/components/dashboard/company-table";
import { CompanyDetailModal } from "@/components/dashboard/company-detail-modal";
import { CSVUpload } from "@/components/dashboard/csv-upload";
import { useThemeContext } from "@/components/ui/theme-provider";
import { Company, Filter } from "@shared/schema";
import { filterCompanies, exportToCSV } from "@/lib/data-utils";

export default function Dashboard() {
  const { theme, toggleTheme } = useThemeContext();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [chartType, setChartType] = useState<"growth" | "scatter" | "sector">(
    "growth"
  );

  const [filters, setFilters] = useState<Filter>({
    selectedYears: [2025], // Default to most recent year
    selectedSectors: [],
    foundingYearRange: [1800, 2025],
    searchTerm: "",
  });

  const handleDataLoaded = (newCompanies: Company[]) => {
    setCompanies(newCompanies);
  };

  const filteredCompanies = useMemo(() => {
    return filterCompanies(companies, filters);
  }, [companies, filters]);

  const handleExport = () => {
    const filename = `singapore-growth-companies-${filters.selectedYears.join(
      "-"
    )}-${Date.now()}.csv`;
    exportToCSV(filteredCompanies, filename);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl lg:text-2xl font-bold">
              Singapore Growth Companies Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExport}
              disabled={filteredCompanies.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          companies={companies}
          filters={filters}
          onFiltersChange={setFilters}
          chartType={chartType}
          onChartTypeChange={setChartType}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* CSV Upload Component */}
          <CSVUpload
            onDataLoaded={handleDataLoaded}
            existingCompanies={companies}
          />

          {companies.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No data loaded</h3>
                  <p className="text-muted-foreground">
                    Upload CSV files above to get started with analyzing company
                    growth data.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    No companies found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredCompanies.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">
                      {(
                        filteredCompanies.reduce(
                          (sum, c) => sum + c.absoluteGrowthRate,
                          0
                        ) / filteredCompanies.length
                      ).toFixed(1)}
                      %
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sectors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(filteredCompanies.map((c) => c.sector)).size}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Years Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filters.selectedYears.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Charts
                  companies={filteredCompanies}
                  chartType={chartType}
                  onCompanySelect={handleCompanySelect}
                />
              </div>

              {/* Company Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CompanyTable
                  companies={filteredCompanies}
                  onCompanySelect={handleCompanySelect}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        allCompanies={companies}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
}
