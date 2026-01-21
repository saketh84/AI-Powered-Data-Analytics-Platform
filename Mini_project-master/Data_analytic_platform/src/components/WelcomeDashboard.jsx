import React from 'react';
import { 
  Settings, Wand2, ArrowUp, Upload, 
  BarChart3, FileSearch, DatabaseZap, Search, FlaskConical 
} from 'lucide-react';

// Reusable Action Card
const ActionCard = ({ icon: Icon, color, label, description, onAction }) => (
  <button 
    onClick={onAction}
    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-left h-full transition-all hover:shadow-md hover:-translate-y-1"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 mt-4 mb-1">{label}</h3>
    <p className="text-sm text-gray-500 mb-3">{description}</p>
    <span className="text-sm font-medium text-blue-600">Watch demo →</span>
  </button>
);

// Reusable Playbook Button
const PlaybookButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export default function WelcomeDashboard({ onQuickAction, onPlaybookClick }) {
  const quickActions = [
    { 
      id: 'upload',
      icon: Upload, 
      color: 'bg-blue-500', 
      label: 'Upload data', 
      description: 'Upload spreadsheets or connect to a data source' 
    },
    { 
      id: 'quantitative',
      icon: BarChart3, 
      color: 'bg-yellow-500', 
      label: 'Quantitative analysis', 
      description: 'Generate charts, tables, insights, data science models & more' 
    },
    { 
      id: 'qualitative',
      icon: FileSearch, 
      color: 'bg-purple-500', 
      label: 'Qualitative analysis', 
      description: 'Add an AI-generated columns to your dataset with Enrichments' 
    },
    { 
      id: 'connect',
      icon: DatabaseZap, 
      color: 'bg-red-500', 
      label: 'Connect to external data', 
      description: 'Securely store your API keys and connect to any data source' 
    }
  ];

  const playbooks = [
    { id: 'clean', icon: Wand2, label: 'Clean data' },
    { id: 'charts', icon: BarChart3, label: 'Generate charts' },
    { id: 'explore', icon: Search, label: 'Exploratory analysis' },
    { id: 'science', icon: FlaskConical, label: 'Data science' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <h1 className="text-4xl font-light text-gray-900">Good Evening, Karthik</h1>
      <h2 className="text-4xl font-light text-gray-500 mt-1">Ready to start analyzing?</h2>

      {/* Main Input Box */}
      <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <textarea
          rows={1}
          placeholder="Ask Formula Bot to predict an outcome in the data..."
          className="w-full p-2 text-base text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none"
        />
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 py-1 px-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              <Upload className="w-4 h-4" />
              Add data
            </button>
            <button className="flex items-center gap-1.5 py-1 px-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              <Wand2 className="w-4 h-4" />
              Add tools
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickActions.map((action) => (
          <ActionCard 
            key={action.id}
            {...action}
            onAction={() => onQuickAction(action.label)}
          />
        ))}
      </div>

      {/* Playbooks */}
      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500 mb-4">or get started quickly with one of our Playbooks</p>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {playbooks.map((playbook) => (
            <PlaybookButton 
              key={playbook.id}
              {...playbook}
              onClick={() => onPlaybookClick(playbook.label)}
            />
          ))}
          <button className="py-2.5 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full">
            See all
          </button>
        </div>
      </div>
    </div>
  );
}