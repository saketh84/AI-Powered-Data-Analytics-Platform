import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../store';
import axios from 'axios';
import {
  Database, FileText, Upload, Plus,
  Lock, Save, Play, Filter, Group, BarChart3,
  TrendingUp, Split, Merge, Code, Calendar,
  Hash, Type, GitBranch, CheckSquare, AlertCircle,
  Activity, Zap, Target, Eye, Sparkles, Loader
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Import the CSS file you just created
import './PipelinePage.css';

// --- 1. Define YOUR project's nodes ---
const nodeDefinitions = {
  sources: [
    { 
      id: 'load_csv', 
      label: 'Load Uploaded CSV', 
      icon: Upload, 
      color: '#F59E0B',
      type: 'load_csv' // This must match your backend registry.py
    },
  ],
  transformations: [
    { 
      id: 'clean_data', 
      label: 'Remove Duplicates', 
      icon: Sparkles, 
      color: '#F59E0B',
      type: 'clean_data' // This must match your backend registry.py
    },
    // Add more nodes here as you build them
    // { id: 'filter', label: 'Filter Rows', icon: Filter, color: '#F59E0B' },
  ],
  analysis: [
    { 
      id: 'analyze_data', 
      label: 'Analyze & Show Dashboard', 
      icon: Eye, 
      color: '#3B82F6', 
      gradient: true,
      type: 'analyze_data' // This must match your backend registry.py
    },
  ]
};
// --- End Node Definitions ---

// --- Sidebar Components ---
const PipelineSidebar = ({ onNodeDragStart }) => {
  return (
    <div className="pipeline-sidebar">
      {/* Sources Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-header">Sources</h3>
        <div className="sidebar-grid">
          {nodeDefinitions.sources.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onDragStart={onNodeDragStart}
            />
          ))}
        </div>
      </div>

      {/* Transformations Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-header">Transformations</h3>
        <div className="sidebar-grid">
          {nodeDefinitions.transformations.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onDragStart={onNodeDragStart}
            />
          ))}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-header">Analysis</h3>
        <div className="sidebar-list">
          {nodeDefinitions.analysis.map(node => (
            <AnalysisCard 
              key={node.id} 
              node={node} 
              onDragStart={onNodeDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const NodeCard = ({ node, onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = node.icon;

  const handleDragStart = (e) => {
    // Set both state and dataTransfer for compatibility
    onDragStart(e, node);
    // Also set dataTransfer data as fallback
    e.dataTransfer.setData('application/json', JSON.stringify(node));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="node-card"
    >
      <div className="node-card-icon" style={{
        backgroundColor: isHovered ? node.color : '#FCD34D', // Use node color on hover
        color: isHovered ? 'white' : '#B45309'
      }}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="node-card-label">
        {node.label}
      </span>
    </div>
  );
};

const AnalysisCard = ({ node, onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = node.icon;

  const handleDragStart = (e) => {
    // Set both state and dataTransfer for compatibility
    onDragStart(e, node);
    // Also set dataTransfer data as fallback
    e.dataTransfer.setData('application/json', JSON.stringify(node));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="analysis-card"
      data-type={node.id}
    >
      <div className="analysis-card-icon" style={{
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : '#FEF3C7',
      }}>
        <Icon size={20} color={isHovered ? 'white' : '#B45309'} strokeWidth={2} />
      </div>
      <span className="analysis-card-label">
        {node.label}
      </span>
    </div>
  );
};
// --- End Sidebar Components ---


// --- Canvas Components ---
const PipelineCanvas = ({ nodes, connections, onCanvasDrop, onNodeDrag, setSelectedNode, selectedNodeId }) => {
  const canvasRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    // Only set dragging over to false if we're actually leaving the canvas
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    onCanvasDrop(e, canvasRef); // Pass the ref
  };

  return (
    <div 
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`pipeline-canvas ${isDraggingOver ? 'dragging-over' : ''}`}
      onClick={() => setSelectedNode(null)} // Deselect on canvas click
    >
      {nodes.length === 0 && (
        <div className="canvas-placeholder">
          <GitBranch size={48} strokeWidth={1.5} />
          <p className="canvas-placeholder-title">
            Start building your pipeline
          </p>
          <p className="canvas-placeholder-sub">
            Drag and drop nodes from the sidebar
          </p>
        </div>
      )}

      {/* Render connections */}
      <svg className="canvas-node-line" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        {connections.map((conn, idx) => (
          <ConnectionLine key={idx} conn={conn} />
        ))}
      </svg>

      {/* Render nodes */}
      {nodes.map((node, idx) => (
        <CanvasNode 
          key={node.id} 
          node={node} 
          index={idx} 
          onDrag={onNodeDrag} 
          onSelect={setSelectedNode}
          isSelected={node.id === selectedNodeId}
        />
      ))}
    </div>
  );
};

const ConnectionLine = ({ conn }) => {
  // Simple straight line for now. We can upgrade to bezier later.
  // Only render if we have valid coordinates
  if (!conn.x1 || !conn.y1 || !conn.x2 || !conn.y2) {
    return null;
  }
  
  return (
    <g>
      <path
        d={`M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`}
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
};

const CanvasNode = ({ node, index, onDrag, onSelect, isSelected }) => {
  const Icon = node.icon;
  const nodeRef = useRef(null);

  const handleDragStart = (e) => {
    // Don't start dragging if clicking on a handle
    if (e.target.classList.contains('canvas-node-handle')) {
      return;
    }
    
    e.stopPropagation();
    const startX = e.clientX - node.x;
    const startY = e.clientY - node.y;
    
    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      onDrag(node.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    // Don't select if clicking on a handle
    if (e.target.classList.contains('canvas-node-handle')) {
      return;
    }
    e.stopPropagation();
    onSelect(node.id);
  }

  const handleHandleMouseDown = (e, handleType) => {
    e.stopPropagation();
    // This will be handled by the parent container's handleMouseDownOnHandle
  };

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleDragStart}
      onClick={handleClick}
      className={`canvas-node ${node.gradient ? 'gradient' : ''} ${isSelected ? 'selected' : ''}`}
      data-type={node.id.split('-')[0]} // e.g., 'analyze_data'
      style={{
        left: node.x,
        top: node.y,
        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
      }}
    >
      <div className="canvas-node-icon">
        <Icon 
          size={24} 
          strokeWidth={2} 
        />
      </div>
      <h4 className="canvas-node-title">
        {node.label}
      </h4>
      <p className="canvas-node-desc">
        {node.description || 'Drag to connect'}
      </p>
      
      {/* --- Handles --- */}
      {node.type !== 'load_csv' && (
        <div 
          className="canvas-node-handle input" 
          data-node-id={node.id} 
          data-handle-type="input"
          onMouseDown={(e) => handleHandleMouseDown(e, 'input')}
          title="Click and drag to connect"
        />
      )}
      {(node.type === 'load_csv' || node.type === 'clean_data') && (
        <div 
          className="canvas-node-handle output" 
          data-node-id={node.id} 
          data-handle-type="output"
          onMouseDown={(e) => handleHandleMouseDown(e, 'output')}
          title="Click and drag to connect"
        />
      )}
    </div>
  );
};
// --- End Canvas Components ---


// --- Main Pipeline Page Component ---
export default function PipelinePage() {
  const navigate = useNavigate();
  
  // Get file from the store
  const { file, setPipelineData } = useDashboardStore();
  const [fileName, setFileName] = useState("No file selected");
  
  // Pipeline state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Connection logic state
  const [isConnecting, setIsConnecting] = useState(false);
  const [startHandle, setStartHandle] = useState(null);
  
  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState(null); // For the output panel

  // Set the file name when the file loads from the store
  useEffect(() => {
    if (file) {
      setFileName(file.name);
    } else {
      // If no file, go home
      navigate('/home');
    }
  }, [file, navigate]);

  const handleNodeDragStart = (e, node) => {
    setDraggedNode(node); // The node from the sidebar
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e, canvasRef) => {
    e.preventDefault();
    
    // Try to get node from state first, then from dataTransfer
    let nodeToAdd = draggedNode;
    
    if (!nodeToAdd) {
      try {
        const data = e.dataTransfer.getData('application/json');
        if (data) {
          nodeToAdd = JSON.parse(data);
        }
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }

    if (!nodeToAdd) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 80; // 80 = half node width
    const y = e.clientY - rect.top - 50;  // 50 = half node height

    const newNode = {
      ...nodeToAdd,
      x,
      y,
      id: `${nodeToAdd.id}-${Date.now()}`,
      description: 'Click to configure'
    };

    setNodes([...nodes, newNode]);
    setDraggedNode(null);
  };

  const handleNodeDrag = (nodeId, newPos) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...newPos } : n));
    updateConnections(nodeId, newPos);
  };
  
  // --- Connection Logic (Drag from handle to handle) ---
  const handleMouseDownOnHandle = (e) => {
    const handle = e.target.closest('.canvas-node-handle');
    if (handle && handle.classList.contains('canvas-node-handle')) {
      e.stopPropagation();
      e.preventDefault();
      setIsConnecting(true);
      setStartHandle(handle);
      
      // Add visual feedback
      handle.style.backgroundColor = 'var(--color-buff)';
      handle.style.transform = 'translateY(-50%) scale(1.5)';
    }
  };
  
  const handleMouseUpOnHandle = useCallback((e) => {
    if (isConnecting && startHandle) {
      // Find the handle under the mouse cursor
      const elementsUnderPoint = document.elementsFromPoint(e.clientX, e.clientY);
      const endHandle = elementsUnderPoint.find(el => 
        el.classList.contains('canvas-node-handle') && el !== startHandle
      );
      
      // Reset start handle visual
      if (startHandle) {
        startHandle.style.backgroundColor = '';
        startHandle.style.transform = '';
      }
      
      if (endHandle && endHandle.classList.contains('canvas-node-handle') && endHandle !== startHandle) {
        e.stopPropagation();
        e.preventDefault();
        
        const startNodeId = startHandle.dataset.nodeId;
        const endNodeId = endHandle.dataset.nodeId;
        
        // Check if connection already exists
        const connectionExists = connections.some(
          conn => conn.from === startNodeId && conn.to === endNodeId
        );
        
        // Ensure one is output and one is input, and connection doesn't exist
        if (
          startHandle.dataset.handleType === 'output' && 
          endHandle.dataset.handleType === 'input' &&
          !connectionExists &&
          startNodeId !== endNodeId
        ) {
          const fromNode = nodes.find(n => n.id === startNodeId);
          const toNode = nodes.find(n => n.id === endNodeId);
          
          if (fromNode && toNode) {
            setConnections(prev => [...prev, { 
              from: startNodeId, 
              to: endNodeId,
              x1: fromNode.x + 160,
              y1: fromNode.y + 60,
              x2: toNode.x,
              y2: toNode.y + 60
            }]);
          }
        }
      }
      
      setIsConnecting(false);
      setStartHandle(null);
    }
  }, [isConnecting, startHandle, connections, nodes]);
  
  // Add global mouse up listener when connecting
  useEffect(() => {
    if (isConnecting) {
      document.addEventListener('mouseup', handleMouseUpOnHandle);
      return () => {
        document.removeEventListener('mouseup', handleMouseUpOnHandle);
      };
    }
  }, [isConnecting, handleMouseUpOnHandle]);
  
  // This updates connection lines as nodes are dragged
  const updateConnections = (nodeId, newPos) => {
    setConnections(conns => conns.map(conn => {
      if (conn.from === nodeId) {
        return { ...conn, x1: newPos.x + 160, y1: newPos.y + 60 }; // Approx. output handle pos
      }
      if (conn.to === nodeId) {
        return { ...conn, x2: newPos.x, y2: newPos.y + 60 }; // Approx. input handle pos
      }
      return conn;
    }));
  };
  
  // Re-calculate all connection positions
  useEffect(() => {
    setConnections(conns => conns.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        return {
          ...conn,
          x1: fromNode.x + 160, // output handle
          y1: fromNode.y + 60, // approx center
          x2: toNode.x, // input handle
          y2: toNode.y + 60 // approx center
        }
      }
      return conn;
    }));
  }, [nodes]);
  
  // --- Pipeline Execution (Same as our old logic) ---
  const handleRunPipeline = async () => {
    if (!file) {
      alert("No file is loaded. Please go to the Home page and upload a file first.");
      return;
    }
    if (nodes.length === 0) {
      alert("Please build a pipeline by dragging nodes onto the canvas.");
      return;
    }
    
    // Convert our nodes/connections to what the backend expects
    const pipelineNodes = nodes.map(n => ({
      id: n.id,
      data: { node_type: n.type } // Send the type ('load_csv', 'clean_data', etc.)
    }));
    
    const pipelineEdges = connections.map((c, i) => ({
      id: `e${i}`,
      source: c.from,
      target: c.to,
      sourceHandle: 'output_1', // We only have one handle
      targetHandle: 'input_1'
    }));

    const pipeline = { nodes: pipelineNodes, edges: pipelineEdges };
    
    setIsLoading(true);
    setOutput({ message: `Running workflow on '${fileName}'...` });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pipeline_json', JSON.stringify(pipeline));

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/workflow/run/", 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      const responseData = response.data.result;
      const rawData = JSON.parse(responseData); 
      
      const lastNode = nodes.find(n => n.type === 'analyze_data');
      if (lastNode && !connections.some(c => c.from === lastNode.id)) {
        setPipelineData(rawData); 
        setOutput({ message: "Analysis complete! Redirecting to dashboard..." });
        setTimeout(() => navigate('/dashboard'), 1500); // Go to dashboard
      } else {
        setOutput({ message: JSON.stringify(rawData, null, 2) });
      }
      setIsLoading(false);

    } catch (error) {
      console.error("Error running pipeline:", error);
      const errorMsg = error.response ? error.response.data.detail : "An error occurred.";
      setOutput({ error: errorMsg });
      setIsLoading(false);
    }
  };


  // Pipeline save and export handlers
  const handlePipelineSave = () => {
    console.log("Pipeline Saved!");
    // You can implement actual save logic here
  };

  const handlePipelineExport = () => {
    console.log("Pipeline Exported!");
    // You can implement actual export logic here
  };

  return (
    <div 
      className="pipeline-page-container"
      onMouseDown={handleMouseDownOnHandle}
    >
      {/* Navbar */}
      <Navbar 
        pageTitle="Pipeline Builder" 
        hasSave={true} 
        hasExport={true} 
        onSave={handlePipelineSave} 
        onExport={handlePipelineExport} 
      />

      {/* Main Content */}
      <div className="pipeline-main-content">
        <PipelineSidebar onNodeDragStart={handleNodeDragStart} />
        <PipelineCanvas 
          nodes={nodes} 
          connections={connections}
          onCanvasDrop={handleCanvasDrop}
          onNodeDrag={handleNodeDrag}
          setSelectedNode={setSelectedNode}
          selectedNodeId={selectedNode}
        />
        
        {/* Control Panel with File Info and Run Button */}
        <div className="pipeline-control-panel">
          <div className="file-display">
            File: <strong>{fileName}</strong>
          </div>
          <button className="run-button" onClick={handleRunPipeline} disabled={isLoading}>
            {isLoading ? <Loader size={16} className="spinner" /> : <Play size={16} fill="white" />}
            {isLoading ? "Running..." : "Run Pipeline"}
          </button>
        </div>
      </div>
      
      {/* Output Panel */}
      {output && (
        <div className="pipeline-output-panel">
          <div className="pipeline-output-header">
            <h3>Pipeline Output:</h3>
            <p onClick={() => setOutput(null)} style={{cursor: 'pointer'}}>Close</p>
          </div>
          <div className="pipeline-output-body">
            <pre className={output.error ? 'error' : ''}>
              {output.error ? `Error: ${output.error}` : output.message}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}