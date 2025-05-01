const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const investorApi = {
  // Create new investor profile
  createInvestor: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/create`, {
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
      throw new Error(error.message || 'Failed to create investor profile');
    }
  },

  // Get investor by ID
  getInvestorById: async (investorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch investor profile');
    }
  },

  // Update investor
  updateInvestor: async (investorId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId, ...updateData })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update investor profile');
    }
  }
};