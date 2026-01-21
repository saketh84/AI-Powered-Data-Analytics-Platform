import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../store';
import { Loader } from 'lucide-react';

import Navbar from '../components/Navbar'; // <-- Keep this import
import DashboardView from '../components/DashboardView';
import ColumnMapping from '../components/ColumnMapping';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { file, pipeline_kpiData } = useDashboardStore();

  React.useEffect(() => {
    if (!file) {
      navigate('/home');
    }
  }, [file, navigate]);

  if (!file) {
     return (
      <div className="loading-container">
        <Loader className="spinner" /> <h2>Loading...</h2>
      </div>
    );
  }

  // You can define onSave and onExport functions here if needed for the dashboard
  const handleDashboardSave = () => console.log("Dashboard Saved!");
  const handleDashboardExport = () => console.log("Dashboard Exported!");


  return (
    <div className="dashboard-page-container">
      {/* --- Use the new Navbar --- */}
      <Navbar 
        pageTitle="Dashboard" 
        hasSave={true} 
        hasExport={true} 
        onSave={handleDashboardSave} 
        onExport={handleDashboardExport} 
      />

      <div className="page-content">
        {pipeline_kpiData ? (
          <DashboardView /> 
        ) : (
          <ColumnMapping />
        )}
      </div>
    </div>
  );
}