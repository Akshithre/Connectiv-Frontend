// Existing utility functions remain the same
export const formatNumberValue = (value) => {
  if (!value) return '0';
  return parseFloat(value).toFixed(2);
};

export const calculateGrossProfit = (revenue, directCosts) => {
  const revenueNum = parseFloat(revenue) || 0;
  const costsPercent = parseFloat(directCosts) || 0;
  return revenueNum * (1 - costsPercent / 100);
};

export const calculateGrossMargin = (revenue, grossProfit) => {
  const revenueNum = parseFloat(revenue) || 0;
  return revenueNum > 0 ? (grossProfit / revenueNum) * 100 : 0;
};

export const validateYear = (year) => {
  const yearNum = parseInt(year);
  return yearNum >= 1900 && yearNum <= 2100;
};

export const validateMonth = (month) => {
  const monthNum = parseInt(month);
  return monthNum >= 1 && monthNum <= 12;
};

export const isValidYearKey = (yearKey) => {
  return /^\d{2}-\d{4}$/.test(yearKey) && 
         validateMonth(yearKey.slice(0, 2)) && 
         validateYear(yearKey.slice(3));
};

// Create default source structure
export const createDefaultSource = (index) => ({
  source: `Source ${index + 1}`,
  targetUsers: 0,
  arpu: 0,
  revenue: 0,
  directCosts: 0,
  grossMargin: 0,
  grossProfit: 0
});

// Create default misc source structure
export const createDefaultMiscSource = (index) => ({
  source: `Misc ${index + 1}`,
  targetUsers: 0,
  arpu: 0,
  revenue: 0,
  directCosts: 0,
  grossMargin: 0,
  grossProfit: 0
});

// Clean source data while preserving empty rows
export const cleanSourceData = (source) => {
  return {
    source: source.source || '',
    targetUsers: parseFloat(source.targetUsers) || 0,
    arpu: parseFloat(source.arpu) || 0,
    revenue: parseFloat(source.revenue) || 0,
    directCosts: parseFloat(source.directCosts) || 0,
    grossMargin: parseFloat(source.grossMargin) || 0,
    grossProfit: parseFloat(source.grossProfit) || 0
  };
};

// Updated transformDataForBackend to maintain structure
export const transformDataForBackend = (yearlyData) => {
  const cleanedData = {};
  
  Object.entries(yearlyData).forEach(([yearKey, yearData]) => {
    // Skip invalid year formats
    if (!isValidYearKey(yearKey)) return;
    
    // Ensure 4 main sources always exist
    const mainSources = Array(4).fill(null).map((_, index) => {
      const existingSource = yearData.mainSources?.[index];
      return existingSource ? cleanSourceData(existingSource) : createDefaultSource(index);
    });
    
    // Ensure 10 misc sources always exist
    const miscSources = Array(10).fill(null).map((_, index) => {
      const existingSource = yearData.miscSources?.[index];
      return existingSource ? cleanSourceData(existingSource) : createDefaultMiscSource(index);
    });
    
    cleanedData[yearKey] = {
      mainSources,
      miscSources,
      description: yearData.description?.trim() || ''
    };
  });
  
  return cleanedData;
};

export const validateSlideData = (data) => {
  const errors = [];
  
  if (!data.revenueStartYear) errors.push('Start year is required');
  if (!data.revenueStartMonth) errors.push('Start month is required');
  if (!data.revenueTargetYear) errors.push('Target year is required');
  
  if (!validateYear(data.revenueStartYear)) {
    errors.push('Invalid start year (must be between 1900 and 2100)');
  }
  
  if (!validateMonth(data.revenueStartMonth)) {
    errors.push('Invalid start month (must be between 1 and 12)');
  }
  
  if (!validateYear(data.revenueTargetYear)) {
    errors.push('Invalid target year (must be between 1900 and 2100)');
  }
  
  if (data.revenueTargetYear < data.revenueStartYear) {
    errors.push('Target year must be greater than or equal to start year');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatYearKey = (month, year) => {
  const paddedMonth = String(month).padStart(2, '0');
  return `${paddedMonth}-${year}`;
};