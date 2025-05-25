'use client';

import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { createProduct } from '@/services/api';

interface ProductData {
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock_quantity: number;
  image_url: string;
}

const BulkProductUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    messages: string[];
  }>({
    total: 0,
    success: 0,
    failed: 0,
    messages: [],
  });
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowResults(false);
    }
  };

  const validateCsvRow = (row: Record<string, string>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Required fields
    if (!row.name) errors.push('Product name is required');
    if (!row.price) errors.push('Price is required');
    if (isNaN(parseFloat(row.price))) errors.push('Price must be a number');
    if (!row.unit) errors.push('Unit is required');
    if (!row.category) errors.push('Category is required');
    if (!row.stock_quantity) errors.push('Stock quantity is required');
    if (row.stock_quantity && isNaN(parseInt(row.stock_quantity))) errors.push('Stock quantity must be a number');
    
    return { valid: errors.length === 0, errors };
  };

  // More robust CSV parsing that handles quoted values and different line endings
  const parseCSV = (text: string): Record<string, string>[] => {
    // Normalize line endings
    const normalizedText = text.replace(/\r\n|\r/g, '\n');
    
    // Split by lines
    const lines = normalizedText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.error('CSV has fewer than 2 lines (needs header + data)');
      return [];
    }
    
    // Parse header row
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    console.log('CSV Headers:', headers);
    
    if (headers.length === 0) {
      console.error('No valid headers found in CSV');
      return [];
    }
    
    // Process data rows
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue; // Skip invalid lines
      
      const row = {} as Record<string, string>;
      headers.forEach((header, index) => {
        row[header] = index < values.length ? values[index] : '';
      });
      
      result.push(row);
    }
    
    return result;
  };
  
  // Helper function to parse a single CSV line, handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle quotes
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quoted string = escaped quote
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        // Normal character
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const processUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setShowResults(false);
    
    try {
      // Read and parse CSV file
      console.log('Reading CSV file:', file.name, file.type, file.size);
      const text = await file.text();
      console.log('CSV content (first 100 chars):', text.substring(0, 100));
      
      // Parse CSV
      const rows = parseCSV(text);
      console.log('Parsed CSV rows:', rows.length, rows.length > 0 ? rows[0] : 'No rows');
      
      if (rows.length === 0) {
        throw new Error('No valid data rows found in CSV. Please check the format and try again.');
      }
      
      const results = {
        total: rows.length,
        success: 0,
        failed: 0,
        messages: [] as string[],
      };
      
      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Processing row ${i + 1}:`, row);
        
        const { valid, errors } = validateCsvRow(row);
        
        if (!valid) {
          console.log(`Row ${i + 1} validation failed:`, errors);
          results.failed++;
          results.messages.push(`Row ${i + 1} (${row.name || 'Unnamed product'}): ${errors.join(', ')}`);
          continue;
        }
        
        try {
          // Prepare product data
          const productData: ProductData = {
            name: row.name,
            description: row.description || '',
            price: parseFloat(row.price),
            unit: row.unit,
            category: row.category,
            stock_quantity: parseInt(row.stock_quantity),
            image_url: row.image_url || '',
          };
          
          console.log(`Sending product data for row ${i + 1}:`, productData);
          
          // Create product
          const result = await createProduct(productData);
          console.log(`Product created successfully:`, result);
          results.success++;
        } catch (error) {
          console.error(`Error creating product for row ${i + 1}:`, error);
          results.failed++;
          results.messages.push(`Row ${i + 1} (${row.name}): Failed to create product - ${(error as Error).message}`);
        }
      }
      
      setResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('CSV processing error:', error);
      setResults({
        total: 0,
        success: 0,
        failed: 1,
        messages: [`Failed to process CSV file: ${(error as Error).message}`],
      });
      setShowResults(true);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,description,price,unit,category,stock_quantity,image_url';
    const sampleRows = [
      '28ChocoMart Chocolate Bar,"Delicious milk chocolate bar, made with premium cocoa",99.99,pcs,chocolate_candy,100,https://example.com/chocolate.jpg',
      '28ChocoMart Coffee,Premium instant coffee,149.50,bottle,beverages,50,https://example.com/coffee.jpg',
      '28ChocoMart Cookies,Chocolate chip cookies,79.99,pack,biscuits_cookies,75,https://example.com/cookies.jpg'
    ];
    const csvContent = `${headers}\n${sampleRows.join('\n')}`;
    
    console.log('Generated template:', csvContent);
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulk Product Upload</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Upload multiple products at once using a CSV file. 
          <button 
            onClick={downloadTemplate}
            className="text-green-600 hover:text-green-800 font-medium ml-2"
          >
            Download template
          </button>
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          
          <div className="text-center mb-4">
            <label className="block">
              <span className="sr-only">Choose CSV file</span>
              <input
                type="file"
                className="block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
          </div>
          
          {file && (
            <div className="w-full">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              
              <button
                onClick={processUpload}
                disabled={uploading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                  uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Products
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showResults && (
        <div className={`rounded-md p-4 mb-4 ${
          results.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center mb-2">
            {results.failed > 0 ? (
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            <h3 className="text-lg font-medium">
              Upload Results
            </h3>
          </div>
          
          <div className="ml-7">
            <p className="text-sm mb-1">
              <span className="font-medium">Total products:</span> {results.total}
            </p>
            <p className="text-sm mb-1 text-green-700">
              <span className="font-medium">Successfully uploaded:</span> {results.success}
            </p>
            {results.failed > 0 && (
              <p className="text-sm mb-1 text-red-700">
                <span className="font-medium">Failed:</span> {results.failed}
              </p>
            )}
            
            {results.messages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Error messages:</p>
                <ul className="text-xs text-red-600 bg-red-50 p-2 rounded-md max-h-40 overflow-y-auto">
                  {results.messages.map((message, index) => (
                    <li key={index} className="mb-1 last:mb-0 pl-2 border-l-2 border-red-300">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">CSV Format Instructions</h3>
        <p className="text-sm text-gray-600 mb-2">
          Your CSV file should include the following columns:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
          <li><span className="font-medium">name</span> - Product name (required)</li>
          <li><span className="font-medium">description</span> - Product description (optional)</li>
          <li><span className="font-medium">price</span> - Product price in PHP (required, numeric)</li>
          <li><span className="font-medium">unit</span> - Unit of measurement (required, e.g., kg, g, pcs)</li>
          <li><span className="font-medium">category</span> - Product category (required, use category ID)</li>
          <li><span className="font-medium">stock_quantity</span> - Available stock (required, numeric)</li>
          <li><span className="font-medium">image_url</span> - URL to product image (optional)</li>
        </ul>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Available Category IDs:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-gray-600">
            <div>biscuits_cookies - Biscuits & Cookies</div>
            <div>chips_crisps - Chips & Crisps</div>
            <div>chocolate_candy - Chocolate & Candy</div>
            <div>condiments_spreads - Condiments & Spreads</div>
            <div>instant_noodles - Instant Noodles</div>
            <div>kids_drinks - Kids&apos;s Drinks</div>
            <div>milk_dairy_alternatives - Milk & Dairy Alternatives</div>
            <div>rtd_coffee - READY-TO-DRINK COFFEE</div>
            <div>soda_sparkling - Soda & Sparkling Drinks</div>
            <div>specialty_snacks - SPECIALTY SNACKS</div>
            <div>fruits - Fruits</div>
            <div>vegetables - Vegetables</div>
            <div>meat_seafood - Meat & Seafood</div>
            <div>bakery - Bakery</div>
            <div>beverages - Beverages</div>
            <div>household - Household</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;
