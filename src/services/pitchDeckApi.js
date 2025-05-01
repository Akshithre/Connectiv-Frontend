// services/pitchDeckApi.js

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const pitchDeckApi = {
  // Update slide data
  updateSlide: async (slideNumber, proposalId, slideData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide${slideNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          ...slideData
        })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || `Failed to update slide ${slideNumber}`);
    }
  },

  // Get slide data
  getSlide: async (slideNumber, proposalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide${slideNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      // Find the specific proposal's data
      const proposalData = data.data.find(item => item.proposalId === proposalId);
      if (!proposalData) {
        throw new Error('Proposal not found');
      }
      
      return proposalData[`slide${slideNumber}`];
    } catch (error) {
      throw new Error(error.message || `Failed to fetch slide ${slideNumber}`);
    }
  }
};