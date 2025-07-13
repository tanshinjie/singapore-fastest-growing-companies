import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Company } from '../../types/Company';
import { formatCurrency } from '../../utils/dataProcessing';

interface RevenueEmployeesScatterProps {
  companies: Company[];
  onCompanyClick: (companyName: string) => void;
}

export const RevenueEmployeesScatter: React.FC<RevenueEmployeesScatterProps> = ({
  companies,
  onCompanyClick
}) => {
  const chartData = companies
    .filter(company => company.revenue2018 && company.employees2018)
    .map(company => ({
      x: company.employees2018,
      y: company.revenue2018,
      name: company.name,
      sector: company.sector,
      year: company.year,
      z: company.absoluteGrowthRate // For potential bubble size
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Revenue vs Employees
      </h3>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 60, left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Employees"
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Number of Employees', position: 'insideBottom', offset: -20 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Revenue"
            tickFormatter={(value) => {
              if (value >= 1000000) return `S$${(value / 1000000).toFixed(0)}M`;
              if (value >= 1000) return `S$${(value / 1000).toFixed(0)}K`;
              return `S$${value}`;
            }}
            label={{ value: 'Revenue (SGD)', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}
            width={100}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => {
              if (name === 'Revenue') return [formatCurrency(Number(value)), 'Revenue'];
              if (name === 'Employees') return [Number(value).toLocaleString(), 'Employees'];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `${data.name} (${data.year}) - ${data.sector}`;
              }
              return label;
            }}
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Scatter 
            name="Companies" 
            data={chartData} 
            fill="#8884d8"
            cursor="pointer"
            onClick={(data) => onCompanyClick(data.name)}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};