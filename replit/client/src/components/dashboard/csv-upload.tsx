import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileText, Check } from 'lucide-react';
import { Company } from '@shared/schema';
import { parseCSVFile } from '@/lib/csv-parser';

interface CSVUploadProps {
  onDataLoaded: (companies: Company[]) => void;
  existingCompanies: Company[];
}

interface UploadedFile {
  file: File;
  year: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  companies?: Company[];
}

export function CSVUpload({ onDataLoaded, existingCompanies }: CSVUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Try to extract year from filename
        const yearMatch = file.name.match(/(\d{4})/);
        const defaultYear = new Date().getFullYear();
        const year = yearMatch ? parseInt(yearMatch[1]) : defaultYear;

        const uploadedFile: UploadedFile = {
          file,
          year,
          status: 'pending'
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFileYear = (fileIndex: number, year: number) => {
    setUploadedFiles(prev => 
      prev.map((file, index) => 
        index === fileIndex ? { ...file, year } : file
      )
    );
  };

  const removeFile = (fileIndex: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    const allCompanies: Company[] = [...existingCompanies];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const uploadedFile = uploadedFiles[i];
      
      setUploadedFiles(prev =>
        prev.map((file, index) =>
          index === i ? { ...file, status: 'processing' } : file
        )
      );

      try {
        const fileText = await uploadedFile.file.text();
        const companies = await parseCSVFile(fileText, uploadedFile.year);
        
        // Remove existing companies from the same year to avoid duplicates
        const filteredExisting = allCompanies.filter(c => c.year !== uploadedFile.year);
        allCompanies.splice(0, allCompanies.length, ...filteredExisting, ...companies);

        setUploadedFiles(prev =>
          prev.map((file, index) =>
            index === i ? { ...file, status: 'success', companies } : file
          )
        );
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map((file, index) =>
            index === i ? { 
              ...file, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Failed to parse CSV'
            } : file
          )
        );
      }
    }

    setIsProcessing(false);
    onDataLoaded(allCompanies);
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload CSV Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-upload">Select CSV Files</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Select one or more CSV files. The year will be auto-detected from the filename or you can set it manually.
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Files</h4>
              <div className="space-x-2">
                <Button
                  onClick={processFiles}
                  disabled={isProcessing || uploadedFiles.some(f => f.status === 'processing')}
                  size="sm"
                >
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`year-${index}`} className="text-xs">Year:</Label>
                      <Input
                        id={`year-${index}`}
                        type="number"
                        value={uploadedFile.year}
                        onChange={(e) => updateFileYear(index, parseInt(e.target.value))}
                        className="w-20 h-8"
                        min="2000"
                        max="2030"
                        disabled={uploadedFile.status === 'processing'}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'pending' && (
                        <div className="w-4 h-4 border-2 border-muted rounded-full" />
                      )}
                      {uploadedFile.status === 'processing' && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <X className="w-4 h-4 text-destructive" />
                      )}

                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={uploadedFile.status === 'processing'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uploadedFiles.some(f => f.status === 'error') && (
              <Alert variant="destructive">
                <AlertDescription>
                  Some files failed to process. Check the error messages and ensure your CSV files have the correct format.
                </AlertDescription>
              </Alert>
            )}

            {uploadedFiles.some(f => f.status === 'success') && (
              <Alert>
                <AlertDescription>
                  Files processed successfully! The data has been loaded into the dashboard.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>Expected CSV Format:</strong> Your CSV files should have columns for Rank, Name, Sector, Absolute growth rate, Compound annual growth rate (CAGR), Revenue (latest), Revenue (base), Number of employees (latest), Number of employees (base), Founding year, and Website.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}