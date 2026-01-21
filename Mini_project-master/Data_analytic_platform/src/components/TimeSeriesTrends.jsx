import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useDashboardStore from '../store';
import { ChevronDown } from 'lucide-react';

// Helper function to parse dates and aggregate
function calculateTimeSeries(rawData, column) {
  if (!rawData || !column) return { seriesData: [], xAxisData: [] };
  
  const monthlyCounts = {};
  for (const row of rawData) {
    try {
      // Try to parse the date
      const date = new Date(row[column]);
      if (isNaN(date.getTime())) continue; // Skip invalid dates
      
      // Create a 'YYYY-MM' key
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore errors for this row
    }
  }
  
  // Sort by date
  const sortedDates = Object.keys(monthlyCounts).sort();
  
  // Format for ECharts
  const data = sortedDates.map(date => (monthlyCounts[date]));
  const labels = sortedDates;

  const seriesData = [{
      name: "Record Count (Actual)",
      type: "line",
      smooth: true,
      data: data
  }];
  
  return { seriesData, xAxisData: labels };
}


export default function TimeSeriesTrends({ initialColumn, initialData, initialXAxis, allColumns }) {
  const { rawData } = useDashboardStore();

  const [selectedColumn, setSelectedColumn] = useState(initialColumn || '');
  
  // This is the chart data
  const { seriesData, xAxisData } = useMemo(() => {
    // On initial load, use the pre-computed data from the backend
    // This ensures we keep the forecast!
    if (selectedColumn === initialColumn) {
      return { seriesData: initialData, xAxisData: initialXAxis };
    }
    // When user changes, re-calculate (this will lose the forecast)
    return calculateTimeSeries(rawData, selectedColumn);
  }, [rawData, selectedColumn, initialColumn, initialData, initialXAxis]);


  // Set initial data on load
  useEffect(() => {
    if (initialColumn) {
      setSelectedColumn(initialColumn);
    }
  }, [initialColumn]);

  const handleColumnChange = (event) => {
    const newColumn = event.target.value;
    setSelectedColumn(newColumn);
  };

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: seriesData.map(s => s.name),
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: 'var(--color-border)' } }
    },
    series: seriesData 
  };
  
  // Handle case where no date column was found
  if (!allColumns || allColumns.length === 0) {
     return (
      <div className="card time-series-chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--color-battle-grey)' }}>No valid time/date column found for trend analysis.</p>
      </div>
    );
  }

  return (
    <div className="card time-series-chart">
      <div className="card-header-with-controls">
        <div className="card-title">Trend Analysis</div>
        <div className="chart-controls">
          <ChevronDown size={16} className="select-icon" />
          <select value={selectedColumn} onChange={handleColumnChange}>
            <option value="" disabled>Select a column</option>
            {allColumns.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '350px' }} />
    </div>
  );
}