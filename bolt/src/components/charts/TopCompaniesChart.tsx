import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Company } from "../../types/Company";
import { formatPercentage } from "../../utils/dataProcessing";

interface TopCompaniesChartProps {
  companies: Company[];
  onCompanyClick: (companyName: string) => void;
  metric: "absoluteGrowthRate" | "cagr";
}

export const TopCompaniesChart: React.FC<TopCompaniesChartProps> = ({
  companies,
  onCompanyClick,
  metric,
}) => {
  const chartData = companies.map((company) => ({
    name:
      company.name.length > 20
        ? company.name.substring(0, 20) + "..."
        : company.name,
    fullName: company.name,
    value: company[metric],
    year: company.year,
    sector: company.sector,
  }));

  const metricLabel =
    metric === "absoluteGrowthRate" ? "Absolute Growth Rate" : "CAGR";

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Top Companies by {metricLabel}
      </h3>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 50, left: 80, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={120}
            fontSize={12}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            label={{
              value: metricLabel + " (%)",
              angle: -90,
              position: "insideLeft",
              textAnchor: "middle",
              dx: -10,
            }}
            width={80}
          />
          <Tooltip
            formatter={(value) => [
              formatPercentage(Number(value)),
              metricLabel,
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `${data.fullName} (${data.year})`;
              }
              return label;
            }}
            contentStyle={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Bar
            dataKey="value"
            fill="#3B82F6"
            cursor="pointer"
            onClick={(data: any) => onCompanyClick(data.fullName)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
