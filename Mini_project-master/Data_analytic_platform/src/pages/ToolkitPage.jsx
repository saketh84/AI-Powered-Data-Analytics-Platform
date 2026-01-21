import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, SlidersHorizontal, FileText, Repeat2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadModal from '../components/UploadModal';

import '../styles/ToolkitPage.css';

const tools = [
  {
    title: "AI-Powered Analysis",
    description: "Automatically analyze your data and surface key trends in seconds",
    icon: <BarChart />,
    action: 'navigate',
    destination: '/ai-analysis',
  },
  {
    title: "Visual Pipeline Builder",
    description: "Build custom workflows to clean, transform, and analyze data.",
    icon: <SlidersHorizontal />,
    action: 'openModal',
    destination: '/pipeline',
  },
  {
    title: "Quick Data Profiler",
    description: "Get a fast overview of your file's columns, data types, and missing values.",
    icon: <FileText />,
    action: 'openModal',
    destination: '/dashboard',
  },
  {
    title: "File Converter",
    description: "Convert between CSV, JSON, and Parquet. (Coming Soon)",
    icon: <Repeat2 />,
    action: 'disabled',
    destination: null,
  },
];

export default function ToolkitPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalNavTarget, setModalNavTarget] = useState(null);

  const handleCardClick = (tool) => {
    if (tool.action === 'navigate') {
      navigate(tool.destination);
    } else if (tool.action === 'openModal') {
      setModalNavTarget(tool.destination);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Floating Transparent Navbar */}
      <nav className="tk-glassy-floating-nav">
          <div className="tk-glassy-nav-inner">
            <div className="tk-nav-logo">
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
            </div>
            <div className="tk-nav-links">
              <a href="#use-cases">Use Cases</a>
              <a href="#faqs">FAQs</a>
            </div>
          </div>
        </nav>

      <div className="tk-page">
        <main className="tk-main">
          {/* Header */}
          <header className="tk-header">
            <motion.h1
              className="tk-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to your Toolkit
            </motion.h1>
            <motion.p
              className="tk-subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Select a tool below to start analyzing your data.
            </motion.p>
          </header>
          {/* Tools Grid */}
          <section className="tk-tools-section">
            <motion.div
              className="tk-tools-grid"
              initial="hidden"
              animate="visible"
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  className="tk-tool-card"
                  style={{ opacity: tool.action === 'disabled' ? 0.7 : 1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
                  }}
                >
                  <div>
                    <div className="tk-tool-top">
                      <div className="tk-tool-icon">{tool.icon}</div>
                    </div>
                    <div className="tk-tool-body">
                      <h3 className="tk-tool-title">{tool.title}</h3>
                      <p className="tk-tool-desc">{tool.description}</p>
                    </div>
                  </div>
                  <div className="tk-tool-footer">
                    <button
                      className="tk-cta-button"
                      onClick={() => handleCardClick(tool)}
                      disabled={tool.action === 'disabled'}
                    >
                      {tool.action === 'disabled' ? 'Coming Soon' : 'Launch Tool'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
          {/* Recent Activity */}
          <motion.section
            className="tk-activity"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="activity-title">Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot"><Clock size={16} /></div>
                <div className="activity-name">You analyzed <strong>dirty_demo_data.csv</strong></div>
                <div className="activity-meta">10m ago</div>
              </div>
              <div className="activity-item">
                <div className="activity-dot"><Clock size={16} /></div>
                <div className="activity-name">You ran a pipeline with <strong>"Remove Duplicates"</strong></div>
                <div className="activity-meta">1h ago</div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
      {/* Upload Modal - Only for Pipeline & Profiler */}
      <UploadModal 
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        destination={modalNavTarget}
      />
    </>
  
  );
}