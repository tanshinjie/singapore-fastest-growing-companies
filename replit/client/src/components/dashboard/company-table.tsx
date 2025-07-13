import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Company } from '@shared/schema';
import { formatCurrency, formatPercentage } from '@/lib/data-utils';

interface CompanyTableProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
}

export function CompanyTable({ companies, onCompanySelect }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = filteredCompanies.sort((a, b) => {
    // First sort by year (descending), then by rank (ascending)
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.rank - b.rank;
  });

  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Company Rankings</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Growth %</TableHead>
                <TableHead className="text-right">CAGR %</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Founded</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompanies.map((company, index) => (
                <TableRow key={`${company.name}-${company.year}`} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{company.rank}</span>
                      <Badge variant="outline" className="text-xs">
                        {company.year}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      {company.website && (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Visit website</span>
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {company.sector}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-success">
                      {formatPercentage(company.absoluteGrowthRate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-warning">
                      {formatPercentage(company.cagr)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm">
                      {formatCurrency(company.revenueLatest)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {company.foundingYear}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCompanySelect(company)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {sortedCompanies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No companies found matching your criteria.</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCompanies.length)} of {sortedCompanies.length} companies
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
