import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function KpiCard({ gridArea, title, value, delta, deltaType = 'neutral' }) {
  
  const isPositive = deltaType === 'positive';
  const isNegative = deltaType === 'negative';
  
  // Determine color based on deltaType
  const deltaColor = isPositive 
    ? 'var(--green-accent)' 
    : isNegative 
    ? 'var(--red-accent)' 
    : 'var(--text-secondary)';

  return (
    <div className={`card ${gridArea}`}>
      <div className="card-title" style={{ marginBottom: '12px' }}>{title}</div>
      <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: deltaColor, fontSize: '0.875rem', fontWeight: '500' }}>
        {isPositive && <ArrowUp size={16} />}
        {isNegative && <ArrowDown size={16} />}
        <span>{delta}</span>
      </div>
    </div>
  );
}