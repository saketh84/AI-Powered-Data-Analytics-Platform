import React from 'react';
import { Database, BarChart2, Zap } from 'lucide-react';

export default function UploadAnimation() {
  // Simple CSS-based animation.
  const style = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--primary-blue)',
    margin: '20px 0 40px 0',
  };
  
  const iconStyle = {
    animation: 'float 3s ease-in-out infinite',
  };

  return (
    <div style={style}>
      <Database size={44} style={{...iconStyle, animationDelay: '0s'}} />
      <BarChart2 size={44} style={{...iconStyle, animationDelay: '0.5s'}} />
      <Zap size={44} style={{...iconStyle, animationDelay: '1s'}} />
    </div>
  );
}