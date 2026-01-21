import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useUpdateNodeInternals,
  Controls,
  Background,
  MiniMap
} from 'reactflow'; 
import 'reactflow/dist/style.css';
import axios from 'axios';
import useDashboardStore from '../store';
import { Loader, Download, Play } from 'lucide-react';
import Papa from 'papaparse';

import PipelineSidebar from './PipelineSidebar';
import CustomPipelineNode from './CustomPipelineNode';
import './PipelineBuilder.css';

// --- Register the new node type ---
const nodeTypes = {
  custom: CustomPipelineNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function PipelineView() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const updateNodeInternals = useUpdateNodeInternals();
  
  const file = useDashboardStore((state) => state.file);
  const setPipelineData = useDashboardStore((state) => state.setPipelineData);
  
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadableData, setDownloadableData] = useState(null);

  useEffect(() => {
    if (file) {
      setFileName(file.name);
    }
  }, [file]);

  // Connection event handlers
  const onConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    console.log('🔵🔵🔵 Connection started:', { nodeId, handleId, handleType, event });
    alert(`Connection started from node ${nodeId}, handle ${handleId}`);
  }, []);

  const onConnectEnd = useCallback((event) => {
    console.log('🔴🔴🔴 Connection ended:', event);
  }, []);
  
  // Debug: Log when clicking anywhere on canvas
  useEffect(() => {
    const handleCanvasClick = (e) => {
      console.log('Canvas clicked:', e.target, e.target.classList);
    };
    const canvas = reactFlowWrapper.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      return () => canvas.removeEventListener('click', handleCanvasClick);
    }
  }, []);

  const onConnect = useCallback(
    (params) => {
      console.log('onConnect called with params:', params);
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true, type: 'smoothstep' }, eds);
        console.log('New edges array:', newEdges);
        return newEdges;
      });
    },
    [setEdges],
  );
  
  // Connection validation - allow connections from source to target
  const isValidConnection = useCallback((connection) => {
    console.log('Validating connection:', connection);
    // Don't allow self-connections
    if (connection.source === connection.target) {
      console.log('Rejected: self-connection');
      return false;
    }
    // Allow all valid connections
    console.log('Connection validated successfully');
    return true;
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowInstance) {
        console.error('ReactFlow instance not initialized');
        return;
      }

      try {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const nodeInfo = JSON.parse(event.dataTransfer.getData('application/reactflow'));

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: getId(),
          type: 'custom', 
          position,
          data: { 
            label: nodeInfo.label,
            node_type: nodeInfo.node_type 
          },
        };

        setNodes((nds) => {
          const updatedNodes = nds.concat(newNode);
          // Update node internals after a short delay to ensure handles are registered
          setTimeout(() => {
            updateNodeInternals(newNode.id);
          }, 50);
          return updatedNodes;
        });
      } catch (error) {
        console.error('Error dropping node:', error);
      }
    },
    [reactFlowInstance, setNodes, updateNodeInternals],
  );
  
  // Update node internals when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      nodes.forEach((node) => {
        updateNodeInternals(node.id);
      });
    }
  }, [nodes.length, updateNodeInternals]);

  const handleRunPipeline = async () => {
    if (!file) {
      alert("No file is loaded. Please go to the Home page and upload a file first.");
      return;
    }
    if (nodes.length === 0) {
      alert("Please build a pipeline by dragging nodes onto the canvas.");
      return;
    }

    const pipeline = { nodes, edges };
    setIsLoading(true);
    setResult(`Running workflow on '${fileName}'...`);
    setDownloadableData(null);

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
      
      const lastNode = nodes.find(n => n.data.node_type === 'analyze_data');
      if (lastNode && !edges.some(e => e.source === lastNode.id)) {
        setPipelineData(rawData); 
        setResult("Analysis complete! Check the '/dashboard' page for updated results.");
        setDownloadableData(null);
      } else {
        setResult(JSON.stringify(rawData, null, 2));
        setDownloadableData(rawData);
      }
      setIsLoading(false);

    } catch (error) {
      const errorMsg = error.response ? error.response.data.detail : "An error occurred.";
      setResult(`Error: ${errorMsg}`);
      setIsLoading(false);
      setDownloadableData(null);
    }
  };

  const handleDownload = () => {
    if (!downloadableData) return;
    const csvString = Papa.unparse(downloadableData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cleaned_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="builder-layout">
      <ReactFlowProvider>
        <PipelineSidebar />
        <div className="builder-canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            connectionMode="loose"
            defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
            snapToGrid={false}
            fitView
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={['Backspace', 'Delete']}
            selectNodesOnDrag={false}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
          
          <div className="control-panel">
            <span className="file-name"><strong>File:</strong> {fileName}</span>
            <button className="run-button" onClick={handleRunPipeline} disabled={isLoading}>
              {isLoading ? <Loader size={16} className="spinner" /> : <Play size={16} fill="white"/>}
              {isLoading ? "Running..." : "Run Pipeline"}
            </button>
          </div>
        </div>
      </ReactFlowProvider>
      
      {result && (
        <div className="result-panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Pipeline Output:</h3>
            {downloadableData && (
              <button className="run-button" onClick={handleDownload} style={{padding: '4px 8px', fontSize: '0.8rem'}}>
                <Download size={14} style={{marginRight: '4px'}}/>
                Download as CSV
              </button>
            )}
          </div>
          <pre className={result.startsWith("Error:") ? 'error' : ''}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
