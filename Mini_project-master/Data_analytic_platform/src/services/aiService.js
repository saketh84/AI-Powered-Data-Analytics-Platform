import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AIService {
  // Send message to AI
  async sendMessage(message, fileData = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        message: message,
        file_context: fileData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Upload file
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get file summary
  async getFileSummary(fileName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/file-summary/${fileName}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file summary:', error);
      throw error;
    }
  }

  // Generate chart
  async generateChart(chartType, data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-chart`, {
        chart_type: chartType,
        data: data
      });
      return response.data;
    } catch (error) {
      console.error('Error generating chart:', error);
      throw error;
    }
  }
}

export default new AIService();