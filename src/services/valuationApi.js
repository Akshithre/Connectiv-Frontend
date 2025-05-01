const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const valuationApi = {
  // Update valuation with computed values
  updateValuation: async (valuationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Update failed');
      }
      
      return data;
    } catch (error) {
      console.error('Valuation update error:', error);
      throw new Error(error.message || 'Failed to update valuation');
    }
  },

  // Create new valuation with computed values
  createValuation: async (valuationData) => {
    try {
      // Format the data similarly to update
      const formattedData = {
        ...valuationData,
        revenue: valuationData.revenue ? formatMapData(valuationData.revenue) : {},
        ebitda: valuationData.ebitda ? formatMapData(valuationData.ebitda) : {},
        capex: valuationData.capex ? formatMapData(valuationData.capex) : {},
        wcap_days: valuationData.wcap_days ? formatMapData(valuationData.wcap_days):{},
        perpetualGrowthRate: parseFloat(valuationData.perpetualGrowthRate) || 0,
        wcap: parseFloat(valuationData.wcap) || 0,
        grossDebt: parseFloat(valuationData.grossDebt) || 0,
        capitalEmployed: parseFloat(valuationData.capitalEmployed) || 0,
        valuation: parseFloat(valuationData.valuation) || 0,
        rating: valuationData.rating || ""
      };

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/create-valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Creation failed');
      }
      
      return data;
    } catch (error) {
      console.error('Valuation creation error:', error);
      throw new Error(error.message || 'Failed to create valuation');
    }
  },

  // Delete valuation
  deleteValuation: async (proposalId) => {
    try {
      if (!proposalId) {
        throw new Error('Proposal ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/delete-valuation`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Deletion failed');
      }
      
      return data;
    } catch (error) {
      console.error('Valuation deletion error:', error);
      throw new Error(error.message || 'Failed to delete valuation');
    }
  }
};

// Helper function to format Map data into regular objects
const formatMapData = (mapData) => {
  if (mapData instanceof Map) {
    return Object.fromEntries(
      Array.from(mapData.entries()).map(([key, value]) => [
        key,
        parseFloat(value) || 0
      ])
    );
  }
  
  if (typeof mapData === 'object') {
    return Object.fromEntries(
      Object.entries(mapData).map(([key, value]) => [
        key,
        parseFloat(value) || 0
      ])
    );
  }
  
  return {};
};