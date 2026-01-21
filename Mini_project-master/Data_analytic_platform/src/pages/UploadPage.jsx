import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useDashboardStore from '../store';
import UploadAnimation from '../components/UploadAnimation';
import { UploadCloud, FileCheck, Loader, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // <-- 1. IMPORT THE NEW XLSX LIBRARY

// We use 'export default' to match your project's pattern
export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [step, setStep] = useState(1);
  
  const [distColumn, setDistColumn] = useState('');
  const [timeColumn, setTimeColumn] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const setInitialAnalysis = useDashboardStore((state) => state.setInitialAnalysis);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setStep(2);
    
    const extension = selectedFile.name.split('.').pop().toLowerCase();

    // --- 2. THIS IS THE NEW "SMART" LOGIC ---
    if (extension === 'csv') {
      // --- Use PapaParse for CSVs ---
      Papa.parse(selectedFile, {
        preview: 1, // Only read the first row
        complete: (results) => {
          setFileHeaders(results.data[0]);
          setDistColumn(results.data[0].find(h => h.includes('category')) || results.data[0][0]);
          setTimeColumn(results.data[0].find(h => h.includes('date')) || results.data[0][0]);
        }
      });
    } else if (extension === 'xls' || extension === 'xlsx') {
      // --- Use XLSX for Excel Files ---
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];
        // Convert sheet to JSON, but only the header row
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0]; 
        
        setFileHeaders(headers);
        setDistColumn(headers.find(h => h.includes('Category')) || headers[0]);
        setTimeColumn(headers.find(h => h.includes('Date')) || headers[0]);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // For other file types (JSON, Parquet), we'll let the backend
      // discover the headers. We can't parse them easily in the browser.
      // We'll just pass an empty array and let the user type them (a future upgrade).
      // For now, we'll just show a simplified message.
      setFileHeaders(['auto-detect']);
      setDistColumn('auto-detect');
      setTimeColumn('auto-detect');
      // Or, we could just run the analysis immediately.
      // Let's stick to the mapping step for consistency.
    }
    // --- END OF NEW LOGIC ---
  };

  const handleRunAnalysis = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('col_dist_target', distColumn);
    formData.append('col_time_target', timeColumn);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setInitialAnalysis(file, response.data);
      
      setIsLoading(false);
      navigate('/workspace');

    } catch (err) {
      setIsLoading(false);
      const errorMsg = err.response ? err.response.data.detail : "An error occurred during analysis.";
      setError(errorMsg);
      console.error(err);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFileHeaders([]);
    setStep(1);
  };

  return (
    <div className="upload-page-container">
      <div className="upload-box" style={{width: '600px'}}>
        
        {step === 1 && (
          <>
            <UploadAnimation />
            <h2>AI-Powered Data Platform</h2>
            <p>Upload your CSV, Excel, or Parquet file to begin analysis.</p>
            <label className="upload-button">
              <UploadCloud size={20} />
              Select File to Analyze
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".csv,.xlsx,.xls,.json,.parquet,.feather,.h5" // <-- Accept prop is already correct
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{marginBottom: '20px'}}>Map Your Data Columns</h2>
            <p>Your file **{file.name}** is ready. Tell us which columns to analyze.</p>
            
            <div className="column-mapper">
              <label>
                Column for **Distribution Chart**:
                <select value={distColumn} onChange={(e) => setDistColumn(e.target.value)}>
                  {fileHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </label>
              <label>
                Column for **Trend Chart**:
                <select value={timeColumn} onChange={(e) => setTimeColumn(e.target.value)}>
                  {fileHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </label>
            </div>
            
            {error && (
              <p style={{ color: 'var(--red-accent)', marginTop: '20px' }}>
                <strong>Analysis Failed:</strong> {error}
              </p>
            )}

            <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
              <button 
                className="secondary-button" 
                onClick={resetUpload} 
                disabled={isLoading}
                style={{flex: 1, justifyContent: 'center'}}
              >
                Cancel
              </button>
              <button 
                className="primary-button" 
                onClick={handleRunAnalysis} 
                disabled={isLoading}
                style={{flex: 2, justifyContent: 'center'}}
              >
                {isLoading ? (
                  <Loader size={20} className="spinner" />
                ) : (
                  <ArrowRight size={20} />
                )}
                {isLoading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}