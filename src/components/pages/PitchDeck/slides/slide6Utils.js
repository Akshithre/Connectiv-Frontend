// Create a new file called slide6Utils.js

export const validateSlide6Data = (data) => {
    const errors = [];
    
    if (!data.profitEstimates?.length) {
      errors.push('Profit estimates are required');
    }
    
    if (!data.kpiMetrics?.length) {
      errors.push('KPI metrics are required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const formatSlide6Data = (data) => {
    return {
      profitEstimates: data.profitEstimates.map(estimate => ({
        name: estimate.name,
        values: Object.fromEntries(
          Object.entries(estimate.values).map(([key, value]) => [key, value.toString()])
        )
      })),
      kpiMetrics: data.kpiMetrics.map(metric => ({
        name: metric.name,
        unit: metric.unit,
        values: Object.fromEntries(
          Object.entries(metric.values).map(([key, value]) => [key, value.toString()])
        )
      }))
    };
  };