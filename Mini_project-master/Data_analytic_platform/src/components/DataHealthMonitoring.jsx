import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Helper to get icon and color based on status
const getStatusVisual = (status) => {
  switch (status) {
    case 'positive':
      return { icon: <CheckCircle size={18} color="var(--green-accent)" />, color: 'var(--green-accent)' };
    case 'negative':
      return { icon: <XCircle size={18} color="var(--red-accent)" />, color: 'var(--red-accent)' };
    case 'neutral':
    default:
      return { icon: <AlertTriangle size={18} color="var(--text-secondary)" />, color: 'var(--text-secondary)' };
  }
};

export default function DataHealthMonitoring({ healthData }) {
  if (!healthData) return <div className="card data-health">Loading...</div>;

  return (
    <div className="card data-health">
      <div className="card-title">Data Health Monitoring</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {healthData.map((item) => {
          const { icon, color } = getStatusVisual(item.status);
          return (
            <div key={item.metric} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {item.metric}
                </span>
              </div>
              <strong style={{ fontSize: '0.875rem', color: color }}>
                {item.value}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}