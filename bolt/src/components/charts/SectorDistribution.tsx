import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Company } from '../../types/Company';

interface SectorDistributionProps {
  companies: Company[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export const SectorDistribution: React.FC<SectorDistributionProps> = ({ companies }) => {
  const sectorCounts = companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sectorCounts)
    .map(([sector, count]) => ({ name: sector, value: count }))
    .sort((a, b) => b.value - a.value);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Companies by Sector
      </h3>
      <div className="flex flex-col xl:flex-row gap-6 h-[500px]">
        {/* Pie Chart */}
        <div className="flex-1 min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius="75%"
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Companies']}
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="w-full xl:w-80 max-h-full overflow-y-auto flex-shrink-0 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Sectors</h4>
          <div className="space-y-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 truncate" title={entry.name}>
                  {entry.name}
                </span>
                <span className="text-gray-500 ml-auto">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};