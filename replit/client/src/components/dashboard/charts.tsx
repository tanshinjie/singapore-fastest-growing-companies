import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts";
import { Company } from "@shared/schema";
import {
  getSectorDistribution,
  getTopCompaniesByGrowth,
  formatCurrency,
  formatPercentage,
} from "@/lib/data-utils";

interface ChartsProps {
  companies: Company[];
  chartType: "growth" | "scatter" | "sector";
  onCompanySelect: (company: Company) => void;
}

const COLORS = [
  "#1976D2",
  "#FF6B35",
  "#4CAF50",
  "#FF9800",
  "#9C27B0",
  "#00BCD4",
  "#795548",
  "#607D8B",
];

const CustomGrowthTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-foreground">
        <p className="font-bold text-base mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          {payload.map((pld) => (
            <div
              key={pld.dataKey}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: pld.color }}
                />
                <span>{pld.name}</span>
              </div>
              <span className="font-medium">
                {formatPercentage(pld.value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomScatterTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as Company & {
      revenue: number;
      employees: number;
    };
    if (!data) return null;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-foreground">
        <div className="font-bold text-base mb-2">{data.name}</div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Revenue:</span>
            <span>{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Employees:</span>
            <span>{data.employees}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function Charts({ companies, chartType, onCompanySelect }: ChartsProps) {
  const topCompanies = useMemo(
    () => getTopCompaniesByGrowth(companies, 10),
    [companies]
  );

  const scatterData = useMemo(
    () =>
      companies.map((company) => ({
        ...company,
        revenue: company.revenueLatest,
        employees: company.employeesLatest,
      })),
    [companies]
  );

  const sectorData = useMemo(
    () => getSectorDistribution(companies),
    [companies]
  );

  const renderChart = () => {
    switch (chartType) {
      case "growth":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topCompanies}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<CustomGrowthTooltip />}
              />
              <Bar
                dataKey="absoluteGrowthRate"
                fill="hsl(var(--primary))"
                name="Absolute Growth"
                onClick={(data) => onCompanySelect(data)}
                className="cursor-pointer hover:opacity-80"
              />
              <Bar
                dataKey="cagr"
                fill="hsl(var(--warning))"
                name="CAGR"
                onClick={(data) => onCompanySelect(data)}
                className="cursor-pointer hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              data={scatterData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="revenue"
                name="Revenue"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                dataKey="employees"
                name="Employees"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<CustomScatterTooltip />}
              />
              <Scatter
                fill="hsl(var(--primary))"
                onClick={(data) => onCompanySelect(data)}
                className="cursor-pointer hover:opacity-80"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "sector":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sector, percentage }) =>
                  `${sector} (${percentage.toFixed(1)}%)`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {sectorData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Companies"]} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case "growth":
        return "Top 10 Companies by Growth Rate";
      case "scatter":
        return "Revenue vs Employees";
      case "sector":
        return "Sector Distribution";
      default:
        return "Chart";
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {getChartTitle()}
          <span className="text-sm text-muted-foreground">
            {companies.length} companies
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
