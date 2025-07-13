import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, BarChart3, Sparkle, PieChart } from "lucide-react";
import { Company, Filter } from "@shared/schema";
import { getUniqueValues } from "@/lib/data-utils";

interface SidebarProps {
  companies: Company[];
  filters: Filter;
  onFiltersChange: (filters: Filter) => void;
  chartType: "growth" | "scatter" | "sector";
  onChartTypeChange: (type: "growth" | "scatter" | "sector") => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  companies,
  filters,
  onFiltersChange,
  chartType,
  onChartTypeChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");

  const availableYears = getUniqueValues(companies, "year").sort(
    (a, b) => b - a
  );
  const availableSectors = getUniqueValues(companies, "sector").sort();

  const handleYearChange = (year: number, checked: boolean) => {
    const newYears = checked
      ? [...filters.selectedYears, year]
      : filters.selectedYears.filter((y) => y !== year);

    onFiltersChange({ ...filters, selectedYears: newYears });
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked
      ? [...filters.selectedSectors, sector]
      : filters.selectedSectors.filter((s) => s !== sector);

    onFiltersChange({ ...filters, selectedSectors: newSectors });
  };

  const handleFoundingYearChange = (range: [number, number]) => {
    onFiltersChange({ ...filters, foundingYearRange: range });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const filteredCompanies = companies.filter((company) => {
    const yearMatch =
      filters.selectedYears.length === 0 ||
      filters.selectedYears.includes(company.year);
    const sectorMatch =
      filters.selectedSectors.length === 0 ||
      filters.selectedSectors.includes(company.sector);
    const foundingYearMatch =
      company.foundingYear >= filters.foundingYearRange[0] &&
      company.foundingYear <= filters.foundingYearRange[1];
    return yearMatch && sectorMatch && foundingYearMatch;
  });

  const avgGrowth =
    filteredCompanies.length > 0
      ? filteredCompanies.reduce(
          (sum, company) => sum + company.absoluteGrowthRate,
          0
        ) / filteredCompanies.length
      : 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        bg-background border-r border-border
      `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Companies</Label>
                <Input
                  id="search"
                  placeholder="Search by name or sector..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Year Selection */}
              <div className="space-y-3">
                <Label>Select Years</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableYears.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={filters.selectedYears.includes(year)}
                        onCheckedChange={(checked) =>
                          handleYearChange(year, checked as boolean)
                        }
                      />
                      <Label htmlFor={`year-${year}`} className="text-sm">
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Selection */}
              <div className="space-y-3">
                <Label>Sectors</Label>
                <ScrollArea className="h-48 w-full border rounded-md p-2">
                  <div className="space-y-2">
                    {availableSectors.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sector-${sector}`}
                          checked={filters.selectedSectors.includes(sector)}
                          onCheckedChange={(checked) =>
                            handleSectorChange(sector, checked as boolean)
                          }
                        />
                        <Label htmlFor={`sector-${sector}`} className="text-xs">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Founding Year Range */}
              <div className="space-y-3">
                <Label>Founding Year Range</Label>
                <div className="px-2">
                  <Slider
                    value={filters.foundingYearRange}
                    onValueChange={(value) =>
                      handleFoundingYearChange(value as [number, number])
                    }
                    max={2025}
                    min={1800}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{filters.foundingYearRange[0]}</span>
                    <span>{filters.foundingYearRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Chart Type Selection */}
              <div className="space-y-3">
                <Label>Chart Type</Label>
                <Select value={chartType} onValueChange={onChartTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Growth Rate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="scatter">
                      <div className="flex items-center space-x-2">
                        <Sparkle className="h-4 w-4" />
                        <span>Revenue vs Employees</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sector">
                      <div className="flex items-center space-x-2">
                        <PieChart className="h-4 w-4" />
                        <span>Sector Distribution</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          {/* Statistics */}
          <Card className="m-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Companies:</span>
                <span className="font-medium">{filteredCompanies.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Growth:</span>
                <span className="font-medium">{avgGrowth.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sectors:</span>
                <span className="font-medium">{availableSectors.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
