import React from 'react';
// 1. Import the icons for your nodes
import { Upload, Sparkles, Eye, Filter } from 'lucide-react'; 

// 2. Define YOUR project's nodes in the new structure
const nodeDefinitions = {
  sources: [
    { 
      id: 'load_csv', 
      label: 'Load CSV', 
      icon: Upload, 
      type: 'load_csv' // This must match your backend registry.py
    },
  ],
  transformations: [
    { 
      id: 'clean_data', 
      label: 'Remove Duplicates', 
      icon: Sparkles, 
      type: 'clean_data' // This must match your backend registry.py
    },
    // Add new nodes here as you build them
    // { 
    //   id: 'filter_rows', 
    //   label: 'Filter Rows', 
    //   icon: Filter, 
    //   type: 'filter_rows'
    // },
  ],
  analysis: [
    { 
      id: 'analyze_data', 
      label: 'Analyze', // Shorter label for the grid
      icon: Eye, 
      type: 'analyze_data' // This must match your backend registry.py
    },
  ]
};

// 3. Node Card sub-component
const NodeCard = ({ node }) => {
  const Icon = node.icon;

  const onDragStart = (e) => {
    // This is the data that will be dropped on the canvas
    const nodeData = {
      node_type: node.type,
      label: node.label,
    };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="node-palette-item" // This class is in PipelineBuilder.css
    >
      <div className="node-palette-icon"> {/* This class is in PipelineBuilder.css */}
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="node-palette-label"> {/* This class is in PipelineBuilder.css */}
        {node.label}
      </span>
    </div>
  );
};

// 4. Main Sidebar Component
export default function PipelineSidebar() {
  return (
    <aside className="builder-sidebar"> {/* This class is in PipelineBuilder.css */}
      
      {/* Sources Section */}
      <div className="node-palette-section">
        <h3 className="node-palette-header">Sources</h3>
        <div className="node-palette-grid">
          {nodeDefinitions.sources.map(node => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Transformations Section */}
      <div className="node-palette-section">
        <h3 className="node-palette-header">Transformations</h3>
        <div className="node-palette-grid">
          {nodeDefinitions.transformations.map(node => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="node-palette-section">
        <h3 className="node-palette-header">Analysis</h3>
        <div className="node-palette-grid">
          {nodeDefinitions.analysis.map(node => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>
      
    </aside>
  );
}