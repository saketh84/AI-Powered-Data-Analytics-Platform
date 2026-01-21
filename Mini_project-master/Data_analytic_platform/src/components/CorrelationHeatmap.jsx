import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function CorrelationHeatmap({ heatmapData }) {
  if (!heatmapData || heatmapData.data.length === 0) {
    return (
      <div className="card data-health" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No numeric data found for correlation analysis.</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        // params.data will be [x, y, value]
        const xLabel = heatmapData.columns[params.data[0]];
        const yLabel = heatmapData.columns[params.data[1]];
        return `Correlation(${xLabel}, ${yLabel}): ${params.data[2]}`;
      }
    },
    grid: {
      height: '70%',
      top: '10%',
      bottom: '20%'
    },
    xAxis: {
      type: 'category',
      data: heatmapData.columns,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: heatmapData.columns,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      // Define the colors: Red (positive), White (zero), Blue (negative)
      color: ['#d63031', '#ffffff', '#0062ff']
    },
    series: [{
      name: 'Correlation',
      type: 'heatmap',
      data: heatmapData.data, // This is the [x, y, value] data from the backend
      label: {
        show: true,
        formatter: (params) => {
          const v = Array.isArray(params.value) ? params.value[2] : params.value;
          return typeof v === 'number' ? v.toFixed(2) : '';
        } // Show value on the square
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div className="card data-health">
      <div className="card-title">Correlation Heatmap</div>
      <ReactECharts option={option} style={{ height: '350px' }} />
    </div>
  );
}