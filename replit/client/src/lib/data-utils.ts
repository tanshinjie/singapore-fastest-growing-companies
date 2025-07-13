import { Company, Filter } from "@shared/schema";

export function filterCompanies(
  companies: Company[],
  filters: Filter
): Company[] {
  return companies.filter((company) => {
    // Year filter
    if (
      filters.selectedYears.length > 0 &&
      !filters.selectedYears.includes(company.year)
    ) {
      return false;
    }

    // Sector filter
    if (
      filters.selectedSectors.length > 0 &&
      !filters.selectedSectors.includes(company.sector)
    ) {
      return false;
    }

    // Founding year range filter
    if (
      company.foundingYear < filters.foundingYearRange[0] ||
      company.foundingYear > filters.foundingYearRange[1]
    ) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        company.sector.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}

export function getUniqueValues<T>(array: T[], key: keyof T): T[keyof T][] {
  return Array.from(new Set(array.map((item) => item[key])));
}

export function getSectorDistribution(
  companies: Company[]
): Array<{ sector: string; count: number; percentage: number }> {
  const sectorCounts: { [key: string]: number } = {};

  companies.forEach((company) => {
    sectorCounts[company.sector] = (sectorCounts[company.sector] || 0) + 1;
  });

  const total = companies.length;

  return Object.entries(sectorCounts).map(([sector, count]) => ({
    sector,
    count,
    percentage: (count / total) * 100,
  }));
}

export function getTopCompaniesByGrowth(
  companies: Company[],
  limit: number = 10
): Company[] {
  return companies
    .sort((a, b) => b.absoluteGrowthRate - a.absoluteGrowthRate)
    .slice(0, limit);
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function exportToCSV(companies: Company[], filename: string): void {
  const headers = [
    "Rank",
    "Name",
    "Sector",
    "Absolute Growth Rate (%)",
    "CAGR (%)",
    "Latest Revenue",
    "Base Revenue",
    "Latest Employees",
    "Base Employees",
    "Founding Year",
    "Website",
    "Year",
  ];

  const csvContent = [
    headers.join(","),
    ...companies.map((company) =>
      [
        company.rank,
        `"${company.name}"`,
        `"${company.sector}"`,
        company.absoluteGrowthRate.toFixed(2),
        company.cagr.toFixed(2),
        company.revenueLatest,
        company.revenueBase,
        company.employeesLatest,
        company.employeesBase,
        company.foundingYear,
        company.website ? `"${company.website}"` : "",
        company.year,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
