import React from 'react';
import { Download } from 'lucide-react';

export default function ReportAndAutomation() {
  const onDownload = () => {
    alert("Report download functionality would be implemented here.");
  };

  return (
    <div className="card report-gen">
      <div className="card-title">Report & Automation</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          Include Summary & KPIs
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          Include Full Data Table
        </label>
      </div>
      <button className="primary-button" style={{ width: '100%' }} onClick={onDownload}>
        <Download size={16} />
        Generate & Download Report
      </button>
    </div>
  );
}