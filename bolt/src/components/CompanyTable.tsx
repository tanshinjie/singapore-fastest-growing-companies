import React from 'react';
import { Company } from '../types/Company';
import { formatCurrency, formatPercentage } from '../utils/dataProcessing';
import { ExternalLink, Building2 } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  onCompanyClick: (companyName: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onCompanyClick
}) => {
  if (companies.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No companies found matching your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Company List ({companies.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Rank</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Company</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Sector</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Year</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Growth Rate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">CAGR</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Revenue</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Employees</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr 
                key={`${company.name}-${company.year}`}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                onClick={() => onCompanyClick(company.name)}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">#{company.rank}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">Founded {company.foundingYear}</div>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Website
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {company.sector}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{company.year}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-green-600">
                    {formatPercentage(company.absoluteGrowthRate)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-purple-600">
                    {formatPercentage(company.cagr)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">
                    {formatCurrency(company.revenue2018)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">
                    {company.employees2018?.toLocaleString() || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};