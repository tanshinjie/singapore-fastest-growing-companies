import React from 'react';
import { CompanyHistoricalData } from '../types/Company';
import { formatCurrency, formatPercentage } from '../utils/dataProcessing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, TrendingUp, Users, Calendar } from 'lucide-react';

interface CompanyDetailPanelProps {
  company: CompanyHistoricalData | null;
  onClose: () => void;
}

export const CompanyDetailPanel: React.FC<CompanyDetailPanelProps> = ({ company, onClose }) => {
  if (!company) return null;

  const chartData = company.yearlyData.map(data => ({
    year: data.year,
    rank: data.rank,
    absoluteGrowthRate: data.absoluteGrowthRate,
    cagr: data.cagr,
    revenue: data.revenue2018,
    employees: data.employees2018
  }));

  const latestData = company.yearlyData[company.yearlyData.length - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{company.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Founded {company.foundingYear}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {company.sector}
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Latest Growth Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatPercentage(latestData.absoluteGrowthRate)}
              </p>
              <p className="text-sm text-blue-700">
                CAGR: {formatPercentage(latestData.cagr)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-green-800">Latest Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(latestData.revenue2018)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Latest Employees</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {latestData.employees2018?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Historical Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Growth Rate</th>
                    <th className="px-4 py-2 text-left">CAGR</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                    <th className="px-4 py-2 text-left">Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {company.yearlyData.map((data, index) => (
                    <tr key={data.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">{data.year}</td>
                      <td className="px-4 py-2">#{data.rank}</td>
                      <td className="px-4 py-2">{formatPercentage(data.absoluteGrowthRate)}</td>
                      <td className="px-4 py-2">{formatPercentage(data.cagr)}</td>
                      <td className="px-4 py-2">{formatCurrency(data.revenue2018)}</td>
                      <td className="px-4 py-2">{data.employees2018?.toLocaleString() || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          {company.yearlyData.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rank Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Rank Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis reversed domain={['dataMin', 'dataMax']} />
                    <Tooltip 
                      formatter={(value) => [`#${value}`, 'Rank']}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rank" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Growth Rate Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Growth Rate Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Growth Rate']}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="absoluteGrowthRate" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};