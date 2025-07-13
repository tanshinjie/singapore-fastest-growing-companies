import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Company } from '../types/Company';
import { parseCSVData } from '../utils/csvParser';

interface FileUploadProps {
  onDataLoaded: (companies: Company[]) => void;
  onClose: () => void;
}

interface UploadedFile {
  name: string;
  year: number;
  data: Company[];
  status: 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const extractYearFromFilename = (filename: string): number => {
    // Try to extract year from filename (e.g., "fastest_2020.csv", "2021_data.csv", etc.)
    const yearMatch = filename.match(/20(2[0-9]|[0-9]{2})/);
    if (yearMatch) {
      return parseInt(yearMatch[0]);
    }
    
    // If no year found, ask user or default to current year
    const currentYear = new Date().getFullYear();
    return currentYear;
  };

  const processFile = useCallback((file: File) => {
    const year = extractYearFromFilename(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          if (result.errors.length > 0) {
            console.warn('CSV parsing warnings:', result.errors);
          }

          // Convert the parsed data to our Company format
          const companies = result.data.map((row: any) => ({
            rank: parseInt(row.Rank || row.rank) || 0,
            name: row.Name || row.name || '',
            website: row.Website || row.website || '',
            sector: row.Sector || row.sector || 'Unknown',
            absoluteGrowthRate: parseFloat(row['Absolute growth rate (in %)'] || row['Absolute growth rate'] || row.absoluteGrowthRate) || 0,
            cagr: parseFloat(row['Compound annual growth rate (CAGR) (in %)'] || row['Compound annual growth rate (CAGR)'] || row['Compound annual growth rate'] || row.cagr) || 0,
            revenue2018: row['Revenue 2018 (in SGD)'] || row['Revenue 2019'] || row['Revenue 2020'] || row['Revenue 2021'] || row['Revenue 2022'] ? 
              parseFloat(row['Revenue 2018 (in SGD)'] || row['Revenue 2019'] || row['Revenue 2020'] || row['Revenue 2021'] || row['Revenue 2022']) : undefined,
            revenue2015: row['Revenue 2015 (in SGD)'] || row['Revenue 2016'] || row['Revenue 2017'] || row['Revenue 2018'] || row['Revenue 2019'] ? 
              parseFloat(row['Revenue 2015 (in SGD)'] || row['Revenue 2016'] || row['Revenue 2017'] || row['Revenue 2018'] || row['Revenue 2019']) : undefined,
            employees2018: row['Number of employees 2018'] || row['Number of employees 2019'] || row['Number of employees 2020'] || row['Number of employees 2021'] || row['Number of employees 2022'] ? 
              parseInt(row['Number of employees 2018'] || row['Number of employees 2019'] || row['Number of employees 2020'] || row['Number of employees 2021'] || row['Number of employees 2022']) : undefined,
            employees2015: row['Number of employees 2015'] || row['Number of employees 2016'] || row['Number of employees 2017'] || row['Number of employees 2018'] || row['Number of employees 2019'] ? 
              parseInt(row['Number of employees 2015'] || row['Number of employees 2016'] || row['Number of employees 2017'] || row['Number of employees 2018'] || row['Number of employees 2019']) : undefined,
            foundingYear: parseInt(row['Founding year'] || row.foundingYear) || 0,
            year
          })).filter(company => company.name && company.rank > 0);

          const uploadedFile: UploadedFile = {
            name: file.name,
            year,
            data: companies,
            status: 'success'
          };

          setUploadedFiles(prev => [...prev, uploadedFile]);
        } catch (error) {
          const uploadedFile: UploadedFile = {
            name: file.name,
            year,
            data: [],
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          setUploadedFiles(prev => [...prev, uploadedFile]);
        }
      },
      error: (error) => {
        const uploadedFile: UploadedFile = {
          name: file.name,
          year: extractYearFromFilename(file.name),
          data: [],
          status: 'error',
          error: error.message
        };
        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    
    files.forEach(processFile);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const loadData = () => {
    const allCompanies = uploadedFiles
      .filter(file => file.status === 'success')
      .flatMap(file => file.data);
    
    onDataLoaded(allCompanies);
    onClose();
  };

  const successfulFiles = uploadedFiles.filter(file => file.status === 'success');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload CSV Files</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">File Format Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CSV files with company growth data</li>
              <li>• Expected columns: Rank, Name, Website, Sector, Growth rates, Revenue, Employees, Founding year</li>
              <li>• File names should include the year (e.g., "fastest_2020.csv", "2021_data.csv")</li>
              <li>• You can upload multiple files for different years</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop CSV files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports multiple file upload
            </p>
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Uploaded Files:</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      file.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          Year: {file.year} | 
                          {file.status === 'success' 
                            ? ` ${file.data.length} companies loaded`
                            : ` Error: ${file.error}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={loadData}
              disabled={successfulFiles.length === 0}
              className={`px-4 py-2 rounded-md transition-colors ${
                successfulFiles.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Load Data ({successfulFiles.length} files)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};