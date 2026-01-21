import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ToolkitPage from './pages/ToolkitPage';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/PipelinePage';
import AIAnalysisPage from './pages/AIAnalysisPage'; // Sidebar will be inside this file
import UploadPage from './pages/UploadPage';
import WorkspacePage from './pages/WorkspacePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<ToolkitPage />} />
      
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/pipeline" element={<PipelinePage />} />
      
      {/* This page handles its own Sidebar internally */}
      <Route path="/ai-analysis" element={<AIAnalysisPage />} />
      
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}