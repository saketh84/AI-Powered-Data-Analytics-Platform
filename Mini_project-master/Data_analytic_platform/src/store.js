import { create } from 'zustand';

// We use 'export default' to match your project's pattern
export default create((set) => ({
  // The raw file, for the pipeline and mapping
  file: null,
  fileHeaders: [], // To store the parsed column names
  rawData: null, // To store the parsed JSON data from the file

  // Data for the *pipeline* result (this is what the Dashboard tab shows)
  pipeline_kpiData: null,
  pipeline_insights: null,
  pipeline_dictionary: null,
  pipeline_columnDist: null,
  pipeline_timeSeries: null,
  pipeline_tableData: null,
  pipeline_dataHealth: null,
  pipeline_correlationMatrix: null,
  
  // This is called from UploadModal
  setFile: (file, headers, rawData = null) => set({
    file: file,
    fileHeaders: headers,
    rawData: rawData,
    // Clear all old analysis data when a new file is uploaded
    pipeline_kpiData: null,
    pipeline_insights: null,
    pipeline_dictionary: null,
    pipeline_columnDist: null,
    pipeline_timeSeries: null,
    pipeline_tableData: null,
    pipeline_dataHealth: null,
    pipeline_correlationMatrix: null,
  }),
  
  // This is called from the new mapping component on the WorkspacePage
  // OR from the PipelineView
  setPipelineData: (data) => set({
    pipeline_kpiData: data?.kpiData || null,
    pipeline_insights: data?.insights || null,
    pipeline_dictionary: data?.dictionary || null,
    pipeline_columnDist: data?.columnDist || null,
    pipeline_timeSeries: data?.timeSeries || null,
    pipeline_tableData: data?.tableData || null,
    pipeline_dataHealth: data?.dataHealth || null,
    pipeline_correlationMatrix: data?.correlationMatrix || null,
  }),
  
  // This is called from the Navbar or when navigating home
  clearAnalysisData: () => set({
    file: null,
    fileHeaders: [],
    rawData: null,
    pipeline_kpiData: null, pipeline_insights: null, pipeline_dictionary: null,
    pipeline_columnDist: null, pipeline_timeSeries: null, pipeline_tableData: null,
    pipeline_dataHealth: null, pipeline_correlationMatrix: null,
  }),
}));
