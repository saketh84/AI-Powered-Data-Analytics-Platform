import React from 'react';
import { Handle, Position } from 'reactflow';
import { Upload, Sparkles, Eye } from 'lucide-react';

// Icon mapping for different node types
const iconMap = {
  load_csv: Upload,
  clean_data: Sparkles,
  analyze_data: Eye,
};

export default function CustomPipelineNode({ data, selected }) {
  const Icon = iconMap[data.node_type] || Upload;
  
  return (
    <div className={`pipeline-node-small ${selected ? 'selected' : ''}`} style={{ position: 'relative' }}>
      {/* Input handle (left side) - only show if not a source node */}
      {data.node_type !== 'load_csv' && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          isConnectable={true}
        />
      )}
      
      <div className="node-content">
        <div className="node-icon">
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="node-label">{data.label}</span>
      </div>
      
      {/* Output handle (right side) - show for all nodes except analyze_data */}
      {data.node_type !== 'analyze_data' && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          isConnectable={true}
        />
      )}
    </div>
  );
}

