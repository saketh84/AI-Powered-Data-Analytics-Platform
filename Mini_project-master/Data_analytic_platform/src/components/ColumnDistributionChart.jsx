import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useDashboardStore from '../store';
import { ChevronDown } from 'lucide-react';

// Helper function to calculate chart data on the frontend
function calculateDistribution(rawData, column) {
  if (!rawData || !column) return [];
  
  const counts = {};
  for (const row of rawData) {
    const value = row[column];
    counts[value] = (counts[value] || 0) + 1;
  }
  
  // Sort by count, get top 10
  const sortedData = Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
    
  return sortedData.map(([name, value]) => ({ name: String(name), value }));
}

// We use 'export default' to match your project's pattern
export default function ColumnDistributionChart({ initialColumn, allColumns, onColumnChange }) {
  // Get all data from the store
  const { 
    rawData,    // This is the *full* dataset
  } = useDashboardStore();

  // Create local state for the chart
  const [selectedColumn, setSelectedColumn] = useState(initialColumn || '');
  
  // This calculates the data to show, either from the initial prop or by re-calculating
  const chartData = useMemo(() => {
    // On first load, 'selectedColumn' will be the initialColumn.
    // When the user changes the dropdown, 'selectedColumn' updates,
    // and this useMemo recalculates the data.
    return calculateDistribution(rawData, selectedColumn);
  }, [rawData, selectedColumn]);

  // Update state when the initial prop changes
  useEffect(() => {
    // When the component first loads, set the column
    if (initialColumn) {
      setSelectedColumn(initialColumn);
    }
  }, [initialColumn]); // Only run when the initial data loads

  // Handle dropdown change
  const handleColumnChange = (event) => {
    const newColumn = event.target.value;
    setSelectedColumn(newColumn);
    if(onColumnChange) onColumnChange(newColumn); // Tell the parent (DashboardView)
  };

  const option = {
    tooltip: { trigger: 'item' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: 'var(--color-border)' } }
    },
    dataZoom: [
      { type: 'inside' },
      { type: 'slider', height: 20, bottom: 10 }
    ],
    series: [{
      name: 'Count',
      type: 'bar',
      data: chartData.map(item => item.value),
      color: 'var(--color-buff)' // Use your new accent color
    }]
  };

  return (
    <div className="card column-dist-chart">
      {/* Add the header with dropdown */}
      <div className="card-header-with-controls">
        <div className="card-title">Distribution</div>
        <div className="chart-controls">
          <ChevronDown size={16} className="select-icon" />
          <select value={selectedColumn} onChange={handleColumnChange}>
            <option value="" disabled>Select a column</option>
            {allColumns && allColumns.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      </div>
      <ReactECharts 
        option={option} 
        style={{ height: '350px' }} 
      />
    </div>
  );
}
