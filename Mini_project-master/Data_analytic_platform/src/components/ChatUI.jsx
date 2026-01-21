import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Loader2, ArrowUp, Paperclip, X, File, BarChart3 
} from 'lucide-react';

// Define the base URL for your FastAPI backend
const API_URL = 'http://127.0.0.1:8000';

export default function ChatUI({ initialInput = '' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialInput);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // New state to track if the agent is ready (file is processed)
  const [agentReady, setAgentReady] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // When component loads, focus input. If there's an initial input, send it.
    inputRef.current?.focus();
    if (initialInput) {
      // We can't send it automatically because we need a file.
      // We'll just pre-fill the input box.
      // If you want to auto-send, you need to manage a globally uploaded file.
    }
  }, [initialInput]);
  
  // --- This is the REAL file upload logic ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);

    // Add user's "file uploaded" message to chat
    const fileMessage = {
      role: 'user',
      content: `I've uploaded ${file.name}. Please analyze this file.`,
      timestamp: new Date(),
      hasFile: true,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + ' KB'
    };
    setMessages(prev => [...prev, fileMessage]);
    
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload_agent`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "File processing failed");

      const aiResponse = {
        role: 'assistant',
        content: `Great! I've analyzed "${file.name}".\n\n${data.message}\n\nWhat would you like me to do with this data?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setAgentReady(true); // *** Agent is now ready! ***
    } catch (error) {
      console.error("Upload Error:", error);
      const aiErrorResponse = {
        role: 'assistant',
        content: `Sorry, I encountered an error trying to process "${file.name}":\n\n${error.message}\n\nPlease check the file or try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorResponse]);
      setUploadedFile(null); 
      setAgentReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- This is the REAL chat logic ---
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const query = input; 
    setInput('');
    setIsLoading(true);

    // --- CHECK IF AGENT IS READY ---
    if (!agentReady || !uploadedFile) {
      const aiResponse = {
        role: 'assistant',
        content: "Please upload a data file (.csv, .xlsx) first using the paperclip icon so I can help you with that.",
        timestamp: new Date(),
      };
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/query_agent`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Query failed");

      const aiResponse = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Query Error:", error);
      const aiErrorResponse = {
        role: 'assistant',
        content: `Sorry, I encountered an error:\n\n${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAgentReady(false); // Reset agent status
    const aiResponse = {
      role: 'assistant',
      content: "File removed. Please upload a new file to continue analysis.",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiResponse]);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto py-10 px-4">
      {/* Chat Messages Area */}
      <div className="flex-1 space-y-8 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ animation: 'slideUp 0.4s ease-out' }}
          >
            {msg.role === 'user' ? (
              <div className="flex justify-end gap-3">
                <div className="max-w-[75%] p-4 bg-blue-600 text-white rounded-2xl text-base leading-relaxed shadow-md">
                  {msg.content}
                  {msg.hasFile && (
                    <div className="mt-3 p-3 bg-blue-700/70 rounded-lg flex items-center gap-3">
                      <File className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{msg.fileName}</div>
                        <div className="text-xs text-blue-100">{msg.fileSize}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center font-semibold text-white flex-shrink-0">
                  K
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="max-w-[75%] p-4 bg-white text-gray-800 rounded-2xl text-base leading-relaxed shadow-md border border-gray-100" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="max-w-[75%] p-4 bg-white text-gray-500 rounded-2xl shadow-md border border-gray-100">
              <span className="flex gap-1.5 items-center">
                Analyzing
                <span className="animate-pulse">...</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-6">
        {uploadedFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 animate-fadeIn">
            <File className="w-5 h-5 text-blue-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-800 truncate">{uploadedFile.name}</div>
              <div className="text-xs text-blue-600">{(uploadedFile.size / 1024).toFixed(2)} KB</div>
            </div>
            <button
              onClick={removeFile}
              className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 border border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors mr-3"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about your data..."
            rows={1}
            className="flex-1 p-3.5 pr-14 text-base text-gray-900 border border-gray-300 rounded-lg resize-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all"
            style={{ minHeight: '54px', maxHeight: '150px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}