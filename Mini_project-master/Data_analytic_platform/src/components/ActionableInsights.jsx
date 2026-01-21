import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function ActionableInsights({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="card insights">
        <div className="card-title">Actionable Insights</div>
        <p style={{ color: 'var(--text-secondary)' }}>No insights generated.</p>
      </div>
    );
  }

  return (
    <div className="card insights">
      <div className="card-title">Actionable Insights</div>
      <ul style={{ listStyle: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {insights.map((item) => (
          <li key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Lightbulb size={18} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {item.insight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}