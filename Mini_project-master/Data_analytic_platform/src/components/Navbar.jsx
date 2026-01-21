import React, { useState } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Logo Component - Updated to match sidebar style
const Logo = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      backgroundColor: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid white',
        borderRadius: '3px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '3px',
          right: '3px',
          height: '2px',
          backgroundColor: 'white'
        }} />
        <div style={{
          position: 'absolute',
          top: '9px',
          left: '3px',
          right: '3px',
          height: '2px',
          backgroundColor: 'white'
        }} />
      </div>
    </div>
    <span style={{
      fontSize: '18px',
      fontWeight: '700',
      color: '#1F2937',
      letterSpacing: '-0.02em'
    }}>
      DATASTREAM
    </span>
  </div>
);

export default function Navbar({ pageTitle = 'Dashboard' }) {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const navigate = useNavigate();

  // Determine current "main" section for breadcrumbs
  const path = window.location.pathname;
  let mainSection = 'Overview';
  if (path.includes('/dashboard')) mainSection = 'Overview';
  else if (path.includes('/pipeline')) mainSection = 'Pipeline Builder';
  else if (path.includes('/workspace')) mainSection = 'Workspace';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Top Navbar */}
      <header style={{
        height: '56px',
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        
        {/* Left: Logo + Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>

          {/* 🔥 CLICKABLE LOGO — GO TO TOOLKIT */}
          <button 
            onClick={() => navigate('/home')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <Logo />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '13px' }}>{mainSection}</span>
            <span style={{ color: '#6B7280', fontSize: '13px' }}>/</span>
            <span style={{ color: '#111827', fontSize: '13px', fontWeight: '500' }}>
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Right Side Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginRight: '8px' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              width: '16px',
              height: '16px',
              strokeWidth: 2
            }} />
            <input
              type="text"
              placeholder="Search anything"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '256px',
                paddingLeft: '36px',
                paddingRight: '48px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '14px',
                backgroundColor: '#F9FAFB',
                border: searchFocused ? '1px solid #D1D5DB' : '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
            <kbd style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '2px 6px',
              fontSize: '12px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              color: '#6B7280'
            }}>
              ⌘K
            </kbd>
          </div>

          {/* 🔔 Notifications */}
          <button 
            style={{
              padding: '8px',
              color: '#6B7280',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bell size={18} strokeWidth={2} />
          </button>

          {/* ⚙️ Settings */}
          <button 
            style={{
              padding: '8px',
              color: '#6B7280',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings size={18} strokeWidth={2} />
          </button>

        </div>

      </header>
    </>
  );
}