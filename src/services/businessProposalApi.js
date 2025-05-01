// services/businessProposalApi.js

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const businessProposalApi = {
  // Create new business proposal
  createProposal: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create business proposal');
    }
  },

  // Get proposal by ID
  getProposalById: async (proposalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch business proposal');
    }
  },

  // Update proposal
  updateProposal: async (proposalId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId, ...updateData })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update business proposal');
    }
  },

  // Update slide-specific data
  updateSlide: async (slideNumber, proposalId, slideData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide${slideNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId, ...slideData })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw new Error(error.message || `Failed to update slide ${slideNumber}`);
    }
  }
};