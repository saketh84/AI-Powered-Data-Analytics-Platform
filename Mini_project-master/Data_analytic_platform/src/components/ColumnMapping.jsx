import React, { useState } from 'react';
import useDashboardStore from '../store';
import axios from 'axios';
import { Loader, ArrowRight } from 'lucide-react';

// We use 'export default' to match your project's pattern
export default function ColumnMapping() {
  // Get the file and headers from the store
  const { file, fileHeaders, setPipelineData } = useDashboardStore();
  
  // Set default values for the dropdowns
  const [distColumn, setDistColumn] = useState(
    fileHeaders.find(h => h.toLowerCase().includes('category')) || (fileHeaders.length > 0 ? fileHeaders[0] : '')
  );
  const [timeColumn, setTimeColumn] = useState(
    fileHeaders.find(h => h.toLowerCase().includes('date')) || (fileHeaders.length > 0 ? fileHeaders[0] : '')
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunAnalysis = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('col_dist_target', distColumn);
    formData.append('col_time_target', timeColumn);

    try {
      // This is the first analysis call
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Save the data to the store (which will make the dashboard appear)
      setPipelineData(response.data); 
      
      setIsLoading(false);
      // No navigation needed, the parent DashboardPage component will just re-render
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err.response ? err.response.data.detail : "An error occurred during analysis.";
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    // We reuse the 'upload-box' style from App.css
    <div className="upload-box" style={{ width: '600px', margin: '5% auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Map Your Data Columns</h2>
      <p>Your file **{file?.name || 'Unknown'}** is ready. Tell us which columns to analyze.</p>
      
      <div className="column-mapper">
        <label>
          Column for **Distribution Chart**:
          <select value={distColumn} onChange={(e) => setDistColumn(e.target.value)}>
            {fileHeaders.length === 0 ? (
              <option value="">Auto-detecting...</option>
            ) : (
              fileHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))
            )}
          </select>
        </label>
        <label>
          Column for **Trend Chart**:
          <select value={timeColumn} onChange={(e) => setTimeColumn(e.target.value)}>
            {fileHeaders.length === 0 ? (
              <option value="">Auto-detecting...</option>
            ) : (
              fileHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))
            )}
          </select>
        </label>
      </div>
      
      {error && (
        <p style={{ color: 'var(--red-accent)', marginTop: '20px' }}>
          <strong>Analysis Failed:</strong> {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        {/* We just have one button here */}
        <button 
          className="primary-button" 
          onClick={handleRunAnalysis} 
          disabled={isLoading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {isLoading ? (
            <Loader size={20} className="spinner" />
          ) : (
            <ArrowRight size={20} />
          )}
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>
    </div>
  );
}
