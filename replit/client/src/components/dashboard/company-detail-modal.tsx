import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Company } from "@shared/schema";
import { formatCurrency, formatPercentage } from "@/lib/data-utils";

interface CompanyDetailModalProps {
  company: Company | null;
  allCompanies: Company[];
  onClose: () => void;
}

export function CompanyDetailModal({
  company,
  allCompanies,
  onClose,
}: CompanyDetailModalProps) {
  const companyHistory = useMemo(() => {
    if (!company) return [];

    return allCompanies
      .filter((c) => c.name === company.name)
      .sort((a, b) => a.year - b.year);
  }, [company, allCompanies]);

  const historicalData = useMemo(() => {
    if (!company) return [];

    // Create historical data points
    const data = [];

    // Add base year data
    data.push({
      year: "Base",
      revenue: company.revenueBase,
      employees: company.employeesBase,
    });

    // Add latest year data
    data.push({
      year: "Latest",
      revenue: company.revenueLatest,
      employees: company.employeesLatest,
    });

    return data;
  }, [company]);

  const rankHistoryData = useMemo(() => {
    return companyHistory.map((c) => ({
      year: c.year,
      rank: c.rank,
      growth: c.absoluteGrowthRate,
    }));
  }, [companyHistory]);

  if (!company) return null;

  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{company.name}</span>
            <Badge variant="outline">{company.year}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="flex h-6 w-6 items-center justify-center rounded-full p-0">
                  <span className="text-xs">#{company.rank}</span>
                </Badge>
                <span className="text-sm font-medium">Rank</span>
              </div>
              <p className="text-2xl font-bold">{company.rank}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Growth Rate</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {formatPercentage(company.absoluteGrowthRate)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">CAGR</span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {formatPercentage(company.cagr)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Founded</span>
              </div>
              <p className="text-2xl font-bold">{company.foundingYear}</p>
            </div>
          </div>

          <Separator />

          {/* Sector and Website */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Sector
              </span>
              <div className="mt-1">
                <Badge variant="secondary">{company.sector}</Badge>
              </div>
            </div>

            {company.website && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Visit Website</span>
                </a>
              </Button>
            )}
          </div>

          <Separator />

          {/* Historical Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Revenue Growth</span>
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={historicalData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Chart */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Employee Growth</span>
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={historicalData}
                    margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Employees",
                      ]}
                    />
                    <Bar
                      dataKey="employees"
                      fill="hsl(var(--warning))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Rank History */}
          {companyHistory.length > 1 && (
            <div className="space-y-4">
              <h4 className="font-medium">Rank History</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankHistoryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="year" />
                    <YAxis
                      yAxisId="rank"
                      orientation="left"
                      domain={[0, "dataMax + 5"]}
                      reversed
                    />
                    <YAxis
                      yAxisId="growth"
                      orientation="right"
                      tickFormatter={(value) => formatPercentage(value)}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "rank" ? `#${value}` : formatPercentage(value),
                        name === "rank" ? "Rank" : "Growth Rate",
                      ]}
                    />
                    <Bar
                      yAxisId="rank"
                      dataKey="rank"
                      fill="hsl(var(--primary))"
                      name="rank"
                    />
                    <Bar
                      yAxisId="growth"
                      dataKey="growth"
                      fill="hsl(var(--success))"
                      name="growth"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
