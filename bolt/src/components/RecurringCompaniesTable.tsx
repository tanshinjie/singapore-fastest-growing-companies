import React from 'react';
import { CompanyHistoricalData } from '../types/Company';
import { formatPercentage } from '../utils/dataProcessing';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RecurringCompaniesTableProps {
  companies: CompanyHistoricalData[];
  onCompanyClick: (companyName: string) => void;
}

export const RecurringCompaniesTable: React.FC<RecurringCompaniesTableProps> = ({
  companies,
  onCompanyClick
}) => {
  const getRankTrend = (yearlyData: CompanyHistoricalData['yearlyData']) => {
    if (yearlyData.length < 2) return null;
    
    const firstRank = yearlyData[0].rank;
    const lastRank = yearlyData[yearlyData.length - 1].rank;
    const change = firstRank - lastRank; // Positive means improved rank (lower number)
    
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  const getGrowthTrend = (yearlyData: CompanyHistoricalData['yearlyData']) => {
    if (yearlyData.length < 2) return null;
    
    const firstGrowth = yearlyData[0].absoluteGrowthRate;
    const lastGrowth = yearlyData[yearlyData.length - 1].absoluteGrowthRate;
    const change = lastGrowth - firstGrowth;
    
    return change;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recurring Companies ({companies.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Company</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Sector</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Years</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Rank Trend</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Latest Growth</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Growth Change</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => {
              const rankTrend = getRankTrend(company.yearlyData);
              const growthChange = getGrowthTrend(company.yearlyData);
              const latestData = company.yearlyData[company.yearlyData.length - 1];
              
              return (
                <tr 
                  key={company.name}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                  onClick={() => onCompanyClick(company.name)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">Founded {company.foundingYear}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {company.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {company.yearlyData.map(d => d.year).join(', ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {company.yearlyData.length} appearances
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {rankTrend && (
                      <div className="flex items-center gap-1">
                        {rankTrend.type === 'up' && (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 text-sm">+{rankTrend.value}</span>
                          </>
                        )}
                        {rankTrend.type === 'down' && (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 text-sm">-{rankTrend.value}</span>
                          </>
                        )}
                        {rankTrend.type === 'same' && (
                          <>
                            <Minus className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600 text-sm">No change</span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {formatPercentage(latestData.absoluteGrowthRate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rank #{latestData.rank}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {growthChange !== null && (
                      <span className={`text-sm ${
                        growthChange > 0 ? 'text-green-600' : 
                        growthChange < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {growthChange > 0 ? '+' : ''}{formatPercentage(growthChange)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};