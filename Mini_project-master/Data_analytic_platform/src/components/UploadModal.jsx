import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import useDashboardStore from '../store';
import { X, File, Database, UploadCloud } from 'lucide-react';
import Papa from 'papaparse'; // <-- We will use this
import * as XLSX from 'xlsx';

Modal.setAppElement('#root');

export default function UploadModal({ isOpen, onRequestClose, destination }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setFileInStore = useDashboardStore((state) => state.setFile);
  const fileInputRef = React.useRef(null);

  // --- NEW: Helper function to parse the full file ---
  const parseFile = (file, extension) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      let headers = [];
      let jsonData = [];
      
      try {
        if (extension === 'csv') {
          // Parse the full CSV
          const csvData = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
          headers = csvData.meta.fields;
          jsonData = csvData.data;
        } else if (extension === 'xls' || extension === 'xlsx') {
          // Parse the full Excel file
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          headers = Object.keys(jsonData[0] || {});
        } else {
          // For other types, we'll send the file but no raw data
          // The backend will have to handle it
          headers = [];
          jsonData = null;
        }
        
        // Save file, headers, AND the raw JSON data to the store
        setFileInStore(file, headers, jsonData);
        resetAndClose();
        navigate(destination); // Go to the correct page

      } catch (err) {
         setError(`Error parsing file: ${err.message}`);
         console.error(err);
      }
    };

    // Read file based on type
    if (extension === 'xls' || extension === 'xlsx') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file); // For CSV and JSON
    }
  };


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setError(null);
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    // Call our new parser function
    parseFile(selectedFile, extension);
  };

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  const resetAndClose = () => {
    setError(null);
    onRequestClose();
  };

  // --- (The JSX is identical to before) ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={resetAndClose}
      className="upload-modal"
      overlayClassName="upload-modal-overlay"
      contentLabel="Upload File Modal"
    >
      <div className="upload-modal-content">
        <div className="upload-modal-header">
          <h3>Add your data</h3>
          <p>Select a file to load into your workspace.</p>
          <button onClick={resetAndClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>
        <div className="upload-modal-bar">
          <button className="top-bar-button active">
            <File size={16} /> Files
          </button>
          <button className="top-bar-button">
            <Database size={16} /> Data Connections
          </button>
        </div>
        <div className="upload-modal-grid">
          <div className="upload-option-card" onClick={onUploadClick}>
            <div className="upload-option-icon excel">
              <UploadCloud size={24} /> 
            </div>
            <h4>Upload Files</h4>
            <p>Upload CSV, Excel, Parquet, and more from your computer.</p>
            <button className="upload-option-button">Upload files</button>
          </div>
          <div className="upload-option-card disabled">
            <div className="upload-option-icon sources">
              <Database size={24} />
            </div>
            <h4>Data Sources</h4>
            <p>Connect to Google Analytics, databases, APIs & more.</p>
            <button className="upload-option-button" disabled>Connect</button>
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange} 
          accept=".csv,.xlsx,.xls,.json,.parquet,.feather,.h5"
        />
        <div className="upload-modal-footer" style={{justifyContent: 'flex-end'}}>
          {error && (
             <p className="error-status" style={{marginRight: 'auto'}}>
                <strong>Error:</strong> {error}
             </p>
          )}
          <button 
            className="primary-button" 
            onClick={resetAndClose} 
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}