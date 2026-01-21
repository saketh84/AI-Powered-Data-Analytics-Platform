import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function DataDictionary({ dictionary }) {
  const [filter, setFilter] = useState('');

  if (!dictionary) {
    return <div className="card dictionary">Loading...</div>;
  }

  const filteredData = dictionary.filter(item => 
    item.columnName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="card dictionary" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-title" style={{ marginBottom: '0' }}>Data Dictionary</div>
      
      {/* Search Bar */}
      <div style={{ position: 'relative', margin: '16px 0' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search columns..." 
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Column List */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '250px' }}>
        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
          {filteredData.map(item => (
            <li key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 4px', 
              borderBottom: '1px solid var(--border-color)' 
            }}>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.columnName}</strong>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary)', 
                  backgroundColor: 'var(--bg-color)', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  marginLeft: '8px' 
                }}>
                  {item.columnType}
                </span>
              </div>
              <span style={{ 
                fontSize: '0.875rem', 
                color: item.metric.startsWith('0.0%') ? 'var(--green-accent)' : 'var(--text-secondary)' 
              }}>
                {item.metric}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}