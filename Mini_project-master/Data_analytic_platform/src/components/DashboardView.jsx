import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../store';

// Import all dashboard components
import KpiCard from '../components/KpiCard';
import ActionableInsights from '../components/ActionableInsights';
import DataDictionary from '../components/DataDictionary';
import ColumnDistributionChart from '../components/ColumnDistributionChart';
import TimeSeriesTrends from '../components/TimeSeriesTrends';
import InteractiveDataTable from '../components/InteractiveDataTable';
import DataHealthMonitoring from '../components/DataHealthMonitoring';
import ReportAndAutomation from '../components/ReportAndAutomation';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import ColumnMapping from '../components/ColumnMapping'; // Import the mapping component
import { Loader } from 'lucide-react'; 
import { Database } from 'lucide-react';

// --- NEW: Helper function to check if a value is a date ---
function isValueDate(value) {
  if (typeof value !== 'string' || !value) {
    return false;
  }
  // Check if it's a number-only string (like "2020"), which we don't want
  if (!isNaN(value) && !value.includes('-') && !value.includes('/')) {
    return false;
  }
  // Try to parse it. This is a very reliable check.
  return !isNaN(new Date(value).getTime());
}

// We use 'export default' to match your project's pattern
export default function DashboardPage() {
  // Get data from the *pipeline* result
  const {
    file,
    pipeline_kpiData,
    pipeline_insights,
    pipeline_dictionary,
    pipeline_columnDist,
    pipeline_timeSeries,
    pipeline_tableData,
    pipeline_dataHealth,
    pipeline_correlationMatrix,
    rawData, 
    fileHeaders,
    setPipelineData // We need this to run the analysis
  } = useDashboardStore();
  
  const navigate = useNavigate();
  const [selectedDistColumn, setSelectedDistColumn] = useState(null);
  
  // State for this page
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- THIS IS THE NEW, SMARTER LOGIC ---
  const { categoricalHeaders, dateHeaders } = useMemo(() => {
    const cats = [];
    const dates = [];
    
    if (rawData && rawData.length > 0) {
      const firstRow = rawData[0];
      for (const header of fileHeaders) {
        const value = firstRow[header];
        
        if (typeof value === 'string') {
          // Use our new helper function to check the value
          if (isValueDate(value)) {
            dates.push(header);
          } else {
            cats.push(header);
          }
        } 
        // We'll ignore numbers for now, but you could add them to 'cats' too
      }
    }
    return { categoricalHeaders: cats, dateHeaders: dates };
  }, [rawData, fileHeaders]);
  // --- END OF NEW LOGIC ---

  // --- Guard & Auto-Analysis ---
  useEffect(() => {
    if (!file) {
      navigate('/home');
      return;
    }
    
    // If a file IS present, but no analysis, AND we are not already loading...
    if (file && !pipeline_kpiData && !isLoading) {
      const runInitialAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        
        // --- NEW: Pass the *auto-detected* columns to the backend ---
        // This will use the first-guess from our new logic
        formData.append('col_dist_target', categoricalHeaders[0] || null);
        formData.append('col_time_target', dateHeaders[0] || null);

        try {
          const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          setPipelineData(response.data); // Save the analysis data
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          setError(err.response ? err.response.data.detail : "An error occurred during analysis.");
          console.error(err);
        }
      };
      
      runInitialAnalysis();
    }
    
    // This part sets the default column for the dropdown
    if (pipeline_columnDist) {
      setSelectedDistColumn(pipeline_columnDist.columnName);
    }
  }, [file, pipeline_kpiData, isLoading, navigate, setPipelineData, categoricalHeaders, dateHeaders]); // Added dependencies

  // --- Render Logic ---
  
  const renderContent = () => {
    // 1. If we are loading the initial analysis
    if (isLoading) {
      return (
        <div className="loading-container" style={{height: '60vh'}}>
          <Loader className="spinner" /> 
          <h2>Running Initial Analysis...</h2>
        </div>
      );
    }
    
    // 2. If the analysis failed
    if (error) {
       return (
         <div className="upload-box" style={{ width: '600px', margin: '5% auto' }}>
           <h2 style={{ marginBottom: '20px' }}>Analysis Failed</h2>
           <p style={{ color: 'var(--red-accent)' }}>
             <strong>Error:</strong> {error}
           </p>
         </div>
       );
    }

    // 3. If analysis is complete
    if (pipeline_kpiData) {
      return (
        <div className="dashboard-layout" style={{padding: '0'}}>
          {/* --- KPIs --- */}
          <KpiCard
            gridArea="kpi-1"
            title="Total Records"
            value={pipeline_kpiData.totalRecords}
            delta={pipeline_kpiData.totalRecordsDelta}
          />
          <KpiCard
            gridArea="kpi-2"
            title="Data Quality"
            value={pipeline_kpiData.dataQuality}
            delta={pipeline_kpiData.dataQualityDelta}
          />
          <KpiCard
            gridArea="kpi-3"
            title="Columns"
            value={pipeline_kpiData.columns}
            delta={pipeline_kpiData.columnsDelta}
          />
          <KpiCard
            gridArea="kpi-4"
            title="Total Anomalies"
            value={pipeline_kpiData.anomalies}
            delta={pipeline_kpiData.anomaliesDelta}
            deltaType={pipeline_kpiData.anomaliesDeltaType}
          />

          {/* --- Insights & Dictionary --- */}
          <ActionableInsights insights={pipeline_insights} />
          <DataDictionary dictionary={pipeline_dictionary} />

          {/* --- Charts --- */}
          <ColumnDistributionChart 
            initialColumn={pipeline_columnDist?.columnName}
            allColumns={categoricalHeaders} // Pass all categorical columns
            onColumnChange={(newColumn) => setSelectedDistColumn(newColumn)}
          />
          <TimeSeriesTrends 
            initialColumn={pipeline_timeSeries?.timeColumn}
            initialData={pipeline_timeSeries?.seriesData}
            initialXAxis={pipeline_timeSeries?.xAxisData}
            allColumns={dateHeaders} // Pass all date columns
          />

          {/* --- Table & Heatmap --- */}
          <InteractiveDataTable 
            rowData={pipeline_tableData.rowData} 
            columnDefs={pipeline_tableData.columnDefs}
            onColumnHeaderClick={(col) => setSelectedDistColumn(col)} 
          />
          
          <div className="correlation-heatmap">
            <CorrelationHeatmap heatmapData={pipeline_correlationMatrix} />
          </div>

          {/* --- Side Cards --- */}
          <div className="health-report-stack">
            <DataHealthMonitoring healthData={pipeline_dataHealth} />
            <ReportAndAutomation />
          </div>
        </div>
      );
    }
    
    // 4. Default loading state
    return (
      <div className="loading-container" style={{height: '60vh'}}>
        <Loader className="spinner" /> 
        <h2>Loading Dashboard...</h2>
      </div>
    );
  };

  return (
    <div className="dashboard-page-container">
      {/* Page Content */}
      <div className="page-content">
        {renderContent()}
      </div>
    </div>
  );
}