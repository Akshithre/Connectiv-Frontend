import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart } from 'recharts';
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  formatNumberValue,
  calculateGrossProfit,
  calculateGrossMargin,
  validateSlideData,
  transformDataForBackend,
  isValidYearKey,
  cleanSourceData,
  formatYearKey,
  validateYear,
  validateMonth,
  createDefaultSource,
  createDefaultMiscSource
} from './slide5Utils';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Slide5 = () => {
  const { updateSlideData, getSlideData, clearSlideData } = usePitchDeck();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  
  const [startMonth, setStartMonth] = useState('');
const [startYear, setStartYear] = useState('');
const [targetYear, setTargetYear] = useState('');
  const [showMiscRows, setShowMiscRows] = useState(false);
  const [yearlyData, setYearlyData] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [description, setDescription] = useState('');
  // Update the initial tempTableData state
// const [tempTableData, setTempTableData] = useState([
//   { source: 'Source 1', targetUsers: '0', arpu: '0', revenue: '0', directCosts: '0', grossMargin: '0', grossProfit: '0' },
//   { source: 'Source 2', targetUsers: '0', arpu: '0', revenue: '0', directCosts: '0', grossMargin: '0', grossProfit: '0' },
//   { source: 'Source 3', targetUsers: '0', arpu: '0', revenue: '0', directCosts: '0', grossMargin: '0', grossProfit: '0' },
//   { source: 'Source 4', targetUsers: '0', arpu: '0', revenue: '0', directCosts: '0', grossMargin: '0', grossProfit: '0' }
// ]);

// Add this at the beginning of the component, after state declarations
useEffect(() => {
  // First check if data exists in context
  const contextData = getSlideData(5);
  
  if (contextData && Object.keys(contextData).length > 0) {
    // Use data from context
    const { revenueStartYear, revenueStartMonth, revenueTargetYear, yearlyData: contextYearlyData, revenueModelDesc } = contextData;
    
    setStartMonth(revenueStartMonth ? String(revenueStartMonth).padStart(2, '0') : '');
    setStartYear(revenueStartYear ? String(revenueStartYear) : '');
    setTargetYear(revenueTargetYear ? String(revenueTargetYear) : '');
    
    if (contextYearlyData) {
      setYearlyData(contextYearlyData);
      const firstYear = Object.keys(contextYearlyData)[0];
      if (firstYear) {
        setSelectedYear(firstYear);
        setTempTableData(contextYearlyData[firstYear].mainSources || defaultTableData);
        setTempMiscRows(contextYearlyData[firstYear].miscSources || defaultMiscRows);
        setDescription(contextYearlyData[firstYear].description || '');
      }
    }
  } else {
    // If no data in context, fetch from backend
    loadSlideData();
  }
}, []); // Run only once on mount

// Update the initial tempTableData state with proper defaults
const defaultTableData = Array(4).fill(null).map((_, index) => createDefaultSource(index));
  const defaultMiscRows = Array(10).fill(null).map((_, index) => createDefaultMiscSource(index));

  // Then define your state that depends on the defaults
  const [tempTableData, setTempTableData] = useState(defaultTableData);
  const [tempMiscRows, setTempMiscRows] = useState(defaultMiscRows);

// Update the initial tempMiscRows state
// Update where tempMiscRows is initialized
const defaultMiscRow = {
  source: '',
  targetUsers: '',  // Changed from '0.0'
  arpu: '',        // Changed from '0.00'
  revenue: '',     // Changed from '0.00'
  directCosts: '', // Changed from '0.00'
  grossMargin: '', // Changed from '0.00'
  grossProfit: ''  // Changed from '0.00'
};

// const [tempMiscRows, setTempMiscRows] = useState(
//   Array(10).fill().map((_, idx) => ({
//     ...defaultMiscRow,
//     source: `Misc ${idx + 1}`
//   }))
// );
  

  // Generate years list based on start and target year
 // Also update the generateYearsList function to handle empty values:
 const generateYearsList = () => {
  const years = [];
  // Only generate list if both years are valid
  if (startYear && targetYear && startMonth) {
    const start = parseInt(startYear);
    const end = parseInt(targetYear);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      for (let year = start; year <= end; year++) {
        years.push(`${startMonth.padStart(2, '0')}-${year}`);
      }
    }
  }
  return years;
};
  const years = generateYearsList();

  // Handler for month input changes
  // Replace the existing handleMonthInputChange function with this:
// In slide5.jsx
// Update handleMonthInputChange
const handleMonthInputChange = (e) => {
  const value = e.target.value;
  
  // Allow empty string or numbers only
  if (value === '') {
    setStartMonth('');
    setIsDirty(true);
    return;
  }

  const numValue = parseInt(value);
  // Check if valid month (1-12)
  if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
    setStartMonth(String(numValue).padStart(2, '0'));
    setIsDirty(true);
    
    // Update yearlyData for the new month
    if (startYear && targetYear) {
      // Create new years data with updated month
      const updatedYearlyData = {};
      Object.entries(yearlyData).forEach(([oldKey, data]) => {
        const year = oldKey.split('-')[1];
        const newKey = `${String(numValue).padStart(2, '0')}-${year}`;
        updatedYearlyData[newKey] = data;
      });
      setYearlyData(updatedYearlyData);
    }
  }
};
  // Handler for year input changes
  // Replace the existing handleYearInputChange function with this:
const handleYearInputChange = (setter) => (e) => {
  const value = e.target.value;
  
  // Only allow empty string or numbers
  if (value === '' || /^\d{0,4}$/.test(value)) {
    setter(value);
    setIsDirty(true);
  }
};

  // Handler for table updates
  // Updated handleTableUpdate function
  // Add these utility functions at the top of your component
  const calculateDerivedValues = (row) => {
    let targetUsers = row.targetUsers === '' ? 0 : parseFloat(row.targetUsers) || 0;
    let arpu = row.arpu === '' ? 0 : parseFloat(row.arpu) || 0;
    let directCosts = row.directCosts === '' ? 0 : parseFloat(row.directCosts) || 0;
    
    // Calculate revenue: Target Users × ARPU/Year
    const revenue = (targetUsers * arpu);
    
    // Calculate gross margin: 100 - Direct costs%
    const grossMargin = 100 - directCosts;
    
    // Calculate gross profit: Revenue × Gross Margin% / 100
    const grossProfit = revenue * (grossMargin / 100);
    
    return {
      ...row,
      revenue: revenue === 0 ? '' : revenue.toFixed(2),
      grossMargin: grossMargin === 0 ? '' : grossMargin.toFixed(2),
      grossProfit: grossProfit === 0 ? '' : grossProfit.toFixed(2)
    };
  };

// Replace the handleTableUpdate function
const handleTableUpdate = (index, field, value, isMiscRow = false) => {
  setIsDirty(true);
  
  let formattedValue = value;
  
  // Format number inputs
  if (['targetUsers', 'arpu', 'directCosts'].includes(field)) {
    if (value === '' || value === '.') {
      formattedValue = value;
    } else if (validateNumericInput(value)) {
      formattedValue = value;
    } else {
      return;
    }
  }

  if (isMiscRow) {
    setTempMiscRows(prevRows => {
      const newRows = [...prevRows];
      const updatedRow = { ...newRows[index] };
      updatedRow[field] = formattedValue;
      
      newRows[index] = ['targetUsers', 'arpu', 'directCosts'].includes(field)
        ? calculateDerivedValues(updatedRow)
        : updatedRow;

      // Update yearlyData immediately
      setYearlyData(prev => ({
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          miscSources: newRows
        }
      }));

      return newRows;
    });
  } else {
    setTempTableData(prevData => {
      const newData = [...prevData];
      const updatedRow = { ...newData[index] };
      updatedRow[field] = formattedValue;
      
      newData[index] = ['targetUsers', 'arpu', 'directCosts'].includes(field)
        ? calculateDerivedValues(updatedRow)
        : updatedRow;

      // Update yearlyData immediately
      setYearlyData(prev => ({
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          mainSources: newData
        }
      }));

      return newData;
    });
  }
};
const toggleMiscRows = () => {
  setShowMiscRows(!showMiscRows);
  setIsDirty(true);
};

  // Handler for description changes
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setIsDirty(true);
  };

  // Calculate chart data
  // Update your calculateChartData function
  // In the calculateChartData function, update this part:
const calculateChartData = () => {
  try {
    return years.map(year => {
      const yearData = yearlyData[year] || { mainSources: [], miscSources: [] };
      const allRows = [...(yearData.mainSources || []), ...(yearData.miscSources || [])];
      
      if (!allRows.length) {
        return {
          year: year.split('-')[1],
          targetUsers: 0,
          revenue: 0,
          grossProfit: 0,
          grossMargin: 0
        };
      }

      // Filter out empty rows
      const nonEmptyRows = allRows.filter(row => 
        (parseFloat(row.targetUsers) || 0) > 0 || 
        (parseFloat(row.revenue) || 0) > 0 || 
        (parseFloat(row.grossProfit) || 0) > 0
      );

      // Calculate totals
      const totalTargetUsers = nonEmptyRows.reduce((sum, row) => 
        sum + (parseFloat(row.targetUsers) || 0), 0);
      const totalRevenue = nonEmptyRows.reduce((sum, row) => 
        sum + (parseFloat(row.revenue) || 0), 0);
      const totalGrossProfit = nonEmptyRows.reduce((sum, row) => 
        sum + (parseFloat(row.grossProfit) || 0), 0);
      
      // Calculate average gross margin
      const validMarginRows = nonEmptyRows.filter(row => parseFloat(row.grossMargin) >= 0);
      const averageGrossMargin = validMarginRows.length > 0 
        ? validMarginRows.reduce((sum, row) => sum + (parseFloat(row.grossMargin) || 0), 0) / validMarginRows.length
        : 0;

      return {
        year: year.split('-')[1],
        targetUsers: parseFloat(totalTargetUsers) || 0, // Remove formatting here
        revenue: parseFloat(totalRevenue) || 0,
        grossProfit: parseFloat(totalGrossProfit) || 0,
        grossMargin: parseFloat(averageGrossMargin) || 0
      };
    });
  } catch (error) {
    console.error('Error calculating chart data:', error);
    return [];
  }
};
  

  
  // Calculate miscellaneous totals
  const calculateMiscTotals = (miscRows) => {
    if (!Array.isArray(miscRows) || miscRows.length === 0) {
      return {
        source: 'Miscellaneous',
        targetUsers: '',
        arpu: '',
        revenue: '',
        directCosts: '',
        grossMargin: '',
        grossProfit: ''
      };
    }
  
    const validRows = miscRows.filter(row => 
      row && 
      typeof row === 'object' && 
      (parseFloat(row.targetUsers) > 0 || parseFloat(row.arpu) > 0)
    );
  
    const totalTargetUsers = validRows.reduce((sum, row) => 
      sum + (parseFloat(row.targetUsers) || 0), 0);
    const totalRevenue = validRows.reduce((sum, row) => 
      sum + (parseFloat(row.revenue) || 0), 0);
    
    // Calculate weighted direct costs
    const weightedDirectCosts = validRows.reduce((sum, row) => {
      const revenue = parseFloat(row.revenue) || 0;
      const directCosts = parseFloat(row.directCosts) || 0;
      return sum + (revenue * directCosts);
    }, 0) / (totalRevenue || 1);
    
    // Calculate gross margin
    const grossMargin = 100 - weightedDirectCosts;
    
    // Calculate gross profit
    const grossProfit = totalRevenue * (grossMargin / 100);
  
    // Calculate average ARPU
    const totalArpu = totalTargetUsers > 0 ? totalRevenue / totalTargetUsers : 0;
  
    return {
      source: 'Miscellaneous',
      targetUsers: totalTargetUsers.toFixed(1),
      arpu: totalArpu.toFixed(2),
      revenue: totalRevenue.toFixed(2),
      directCosts: weightedDirectCosts.toFixed(2),
      grossMargin: grossMargin.toFixed(2),
      grossProfit: grossProfit.toFixed(2)
    };
  };

  // Add this useEffect to handle month changes
useEffect(() => {
  if (startMonth && startYear && targetYear) {
    const years = generateYearsList();
    const newYearlyData = {};
    
    // Transfer existing data to new month format
    years.forEach(yearKey => {
      const year = yearKey.split('-')[1];
      const oldKey = Object.keys(yearlyData).find(k => k.endsWith(year));
      if (oldKey && yearlyData[oldKey]) {
        newYearlyData[yearKey] = yearlyData[oldKey];
      } else {
        // Initialize with default data
        newYearlyData[yearKey] = {
          mainSources: defaultTableData,
          miscSources: defaultMiscRows,
          description: ''
        };
      }
    });
    
    setYearlyData(newYearlyData);
    
    // Set selected year to first year if not already set
    if (!selectedYear || !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }
}, [startMonth, startYear, targetYear]);

  // Calculate totals
 // Replace the existing calculateTotals function with this:
const calculateTotals = (mainData, miscRows) => {
  // Handle empty or invalid data
  if (!Array.isArray(mainData) || !Array.isArray(miscRows)) {
    return {
      source: 'Total',
      targetUsers: '',
      arpu: '',
      revenue: '',
      directCosts: '',
      grossMargin: '',
      grossProfit: ''
    };
  }

  // Filter valid rows
  const validMainData = mainData.filter(row => 
    row && 
    typeof row === 'object' && 
    (parseFloat(row.targetUsers) > 0 || parseFloat(row.arpu) > 0)
  );

  const validMiscRows = miscRows.filter(row => 
    row && 
    typeof row === 'object' && 
    (parseFloat(row.targetUsers) > 0 || parseFloat(row.arpu) > 0)
  );

  // Calculate totals from main data
  const mainSums = validMainData.reduce((acc, row) => ({
    targetUsers: acc.targetUsers + (parseFloat(row.targetUsers) || 0),
    revenue: acc.revenue + (parseFloat(row.revenue) || 0),
  }), { targetUsers: 0, revenue: 0 });

  // Calculate totals from misc data
  const miscSums = validMiscRows.reduce((acc, row) => ({
    targetUsers: acc.targetUsers + (parseFloat(row.targetUsers) || 0),
    revenue: acc.revenue + (parseFloat(row.revenue) || 0),
  }), { targetUsers: 0, revenue: 0 });

  // Calculate combined totals
  const totalTargetUsers = mainSums.targetUsers + miscSums.targetUsers;
  const totalRevenue = mainSums.revenue + miscSums.revenue;

  // Calculate weighted direct costs
  const allRows = [...validMainData, ...validMiscRows];
  const weightedDirectCosts = allRows.reduce((sum, row) => {
    const revenue = parseFloat(row.revenue) || 0;
    const directCosts = parseFloat(row.directCosts) || 0;
    return sum + (revenue * directCosts);
  }, 0) / (totalRevenue || 1);

  // Calculate final metrics
  const totalArpu = totalTargetUsers > 0 ? totalRevenue / totalTargetUsers : 0;
  const grossMargin = 100 - weightedDirectCosts;
  const grossProfit = totalRevenue * (grossMargin / 100);

  return {
    source: 'Total',
    targetUsers: Math.round(totalTargetUsers), // Round to whole numbers
    arpu: Math.round(totalArpu * 100) / 100, // Round to 2 decimal places
    revenue: Math.round(totalRevenue * 100) / 100,
    directCosts: Math.round(weightedDirectCosts * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100
  };
};

  // Load initial data
 // Update the loadSlideData effect
// In slide5.jsx
// Update the loadSlideData function
const loadSlideData = async () => {
  if (!proposalId) return;

  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide5/${proposalId}`);
    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to load data');
    }

    if (data.data?.slide5) {
      const { revenueStartYear, revenueStartMonth, revenueTargetYear, yearlyData: receivedYearlyData } = data.data.slide5;
      
      // Set initial values
      setStartMonth(revenueStartMonth ? String(revenueStartMonth).padStart(2, '0') : '');
      setStartYear(revenueStartYear ? String(revenueStartYear) : '');
      setTargetYear(revenueTargetYear ? String(revenueTargetYear) : '');

      // Initialize yearly data
      if (receivedYearlyData && Object.keys(receivedYearlyData).length > 0) {
        setYearlyData(receivedYearlyData);
        
        // Set first available year as selected
        const firstYear = Object.keys(receivedYearlyData)[0];
        setSelectedYear(firstYear);
        
        // Set initial table data
        const yearData = receivedYearlyData[firstYear];
        if (yearData) {
          setTempTableData(yearData.mainSources?.length ? yearData.mainSources : defaultTableData);
          setTempMiscRows(yearData.miscSources?.length ? yearData.miscSources : defaultMiscRows);
          setDescription(yearData.description || '');
        }
      }
    }
  }  catch (error) {
    console.error('Error loading slide data:', error);
    setError(error.message || 'Failed to load data');
    toast.error('Failed to load slide data', {
      toastId: 'load-error'
    });
  } finally {
    setIsLoading(false);
  }
};

// Update the useEffect hook that initializes data
useEffect(() => {
  if (proposalId) {
    loadSlideData();
  }
}, [proposalId]);

  // Initialize years data
  // In useEffect for initializing years data
  useEffect(() => {
    const years = generateYearsList();
    if (years.length > 0) {
      const firstYear = years[0];
      
      // Set selected year if not set
      if (!selectedYear) {
        setSelectedYear(firstYear);
      }
  
      // Initialize data for first year if no data exists
      setYearlyData(prev => {
        if (!prev[firstYear]) {
          return {
            ...prev,
            [firstYear]: {
              mainSources: defaultTableData,
              miscSources: tempMiscRows,
              description: ''
            }
          };
        }
        return prev;
      });
    }
  }, [startMonth, startYear, targetYear]);

  // Update data when year selection changes
  // Update data when year selection changes
  useEffect(() => {
    if (selectedYear) {
      if (yearlyData[selectedYear]) {
        // If data exists for this year, load it
        const yearData = yearlyData[selectedYear];
        
        // Ensure all main sources exist
        const mainSources = Array(4).fill(null).map((_, index) => {
          const existingSource = yearData.mainSources?.[index];
          return existingSource ? {
            source: existingSource.source || `Source ${index + 1}`,
            targetUsers: existingSource.targetUsers?.toString() || '',
            arpu: existingSource.arpu?.toString() || '',
            revenue: existingSource.revenue?.toString() || '',
            directCosts: existingSource.directCosts?.toString() || '',
            grossMargin: existingSource.grossMargin?.toString() || '',
            grossProfit: existingSource.grossProfit?.toString() || ''
          } : createDefaultSource(index);
        });
        
        // Ensure all misc sources exist
        const miscSources = Array(10).fill(null).map((_, index) => {
          const existingSource = yearData.miscSources?.[index];
          return existingSource ? {
            source: existingSource.source || `Misc ${index + 1}`,
            targetUsers: existingSource.targetUsers?.toString() || '',
            arpu: existingSource.arpu?.toString() || '',
            revenue: existingSource.revenue?.toString() || '',
            directCosts: existingSource.directCosts?.toString() || '',
            grossMargin: existingSource.grossMargin?.toString() || '',
            grossProfit: existingSource.grossProfit?.toString() || ''
          } : createDefaultMiscSource(index);
        });
        
        setTempTableData(mainSources);
        setTempMiscRows(miscSources);
        setDescription(yearData.description || '');
      } else {
        // If no data exists for this year, set default values
        setTempTableData(defaultTableData);
        setTempMiscRows(Array(10).fill(null).map((_, idx) => createDefaultMiscSource(idx)));
        setDescription('');
      }
    }
  }, [selectedYear]);

  const cleanYearlyData = (data) => {
    const validYears = generateYearsList();
    const cleanedData = {};
    
    validYears.forEach(yearKey => {
      if (data[yearKey]) {
        // Clean up the data for each year
        const yearData = data[yearKey];
        cleanedData[yearKey] = {
          ...yearData,
          mainSources: yearData.mainSources.map(source => ({
            ...source,
            targetUsers: source.targetUsers === '' ? 0 : parseFloat(source.targetUsers) || 0,
            arpu: source.arpu === '' ? 0 : parseFloat(source.arpu) || 0,
            revenue: source.revenue === '' ? 0 : parseFloat(source.revenue) || 0,
            directCosts: source.directCosts === '' ? 0 : parseFloat(source.directCosts) || 0,
            grossMargin: source.grossMargin === '' ? 0 : parseFloat(source.grossMargin) || 0,
            grossProfit: source.grossProfit === '' ? 0 : parseFloat(source.grossProfit) || 0
          }))
        };
      }
    });
    
    return cleanedData;
  };

  // Add this effect to keep context updated
useEffect(() => {
  if (isDirty && selectedYear) {
    const contextData = {
      revenueStartYear: startYear ? parseInt(startYear) : null,
      revenueStartMonth: startMonth ? parseInt(startMonth) : null,
      revenueTargetYear: targetYear ? parseInt(targetYear) : null,
      yearlyData,
      revenueModelDesc: description
    };
    
    updateSlideData(5, contextData);
  }
}, [yearlyData, selectedYear, startYear, startMonth, targetYear, description, isDirty]);
  // Handle save
  // In slide5.jsx
  const handleSave = async () => {
    if (!proposalId) {
      setError('No proposal ID found');
      toast.error('No proposal ID found', {
        toastId: 'no-proposal-id'
      });
      return;
    }
     
    try {
      setIsLoading(true);
      setError(null);
     
      const cleanedYearlyData = transformDataForBackend(yearlyData);
      const slideData = {
        proposalId,
        revenueStartYear: parseInt(startYear),
        revenueStartMonth: parseInt(startMonth),
        revenueTargetYear: parseInt(targetYear),
        yearlyData: cleanedYearlyData,
        revenueModelDesc: description?.trim() || ''
      };
     
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slideData)
      });
     
      const responseData = await response.json();
     
      if (!responseData.status) {
        throw new Error(responseData.message || 'Failed to save slide');
      }
     
      updateSlideData(5, slideData);
      setIsDirty(false);
      
      // Add success toast notification
      toast.success('Changes saved successfully!', {
        toastId: 'save-success',
        style: {
          background: '#17843f',
          color: 'white',
          fontWeight: '500',
        }
      });
     
    } catch (error) {
      console.error('Error saving slide:', error);
      setError(error.message || 'Failed to save slide');
      toast.error(error.message || 'Failed to save changes', {
        toastId: 'save-error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const validateNumericInput = (value, allowDecimals = true) => {
    if (value === '') return true;
    if (allowDecimals) {
      // Allow numbers with optional decimal point
      return /^\d*\.?\d*$/.test(value);
    }
    // Only allow whole numbers
    return /^\d*$/.test(value);
  };
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const message = "You have unsaved changes!";
        event.returnValue = message;
        return message;
      }
    };

    const handleNavigation = (event) => {
      if (isDirty) {
        const currentSlideData = document.querySelector(`[data-slide="5"]`);
        
        event.preventDefault();
        toast.warn(
          <div>
            <p className="mb-2">You have unsaved changes!</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDirty(false);
                  toast.dismiss();
                }}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Discard
              </button>
              <button
                onClick={async () => {
                  const saveButton = currentSlideData?.querySelector('[data-save-button]');
                  if (saveButton) {
                    await saveButton.click();
                  }
                  toast.dismiss();
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "light",
            closeButton: false
          }
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [isDirty]);
  return (
    <div className="h-full relative" data-slide="5" data-is-dirty={isDirty.toString()}>
      <ToastContainer
        position="top-center"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme="light"
        limit={1}
      />
       {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#527853] w-full p-4 mb-6 rounded-t-lg">
          <h2 className="text-center text-2xl font-medium text-white">Revenue Model</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Period Selection */}
          {/* Period Selection */}
          <div className="flex gap-4 mb-6">
  <div>
    <label className="block text-sm font-medium mb-1">Start Month (1-12)</label>
    <input
      type="text"
      value={startMonth}
      onChange={handleMonthInputChange}
      className="p-2 border rounded w-20"
      maxLength="2"
      placeholder="03"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1">Start Year</label>
    <input
      type="text"
      value={startYear}
      onChange={handleYearInputChange(setStartYear)}
      className="p-2 border rounded w-24"
      maxLength="4"
      placeholder="2021"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1">Target Year</label>
    <input
      type="text"
      value={targetYear}
      onChange={handleYearInputChange(setTargetYear)}
      className="p-2 border rounded w-24"
      maxLength="4"
      placeholder="2025"
    />
  </div>
</div>

          <div className="flex gap-6">
            {/* Main Table Section */}
            <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
  <select 
    className="p-2 border rounded bg-white"
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    disabled={years.length === 0}
  >
    {years.length === 0 ? (
      <option value="">No years available</option>
    ) : (
      <>
        <option value="">Select a year</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </>
    )}
  </select>
</div>

              <div className="flex mb-4">
                <div className="w-2/3">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-[#527853] text-white">Source</th>
                        <th className="border p-2 bg-[#527853] text-white">Target Users</th>
                        <th className="border p-2 bg-[#527853] text-white">ARPU/Year</th>
                        <th className="border p-2 bg-[#527853] text-white">Revenue</th>
                        <th className="border p-2 bg-[#527853] text-white">Direct Costs %</th>
                        <th className="border p-2 bg-[#527853] text-white">Gross Margin%</th>
                        <th className="border p-2 bg-[#527853] text-white">Gross Profit</th>
                      </tr>
                    </thead>
                   

                    <tbody>
  {/* Main Source Rows */}
  {tempTableData.map((row, index) => (
  <tr key={`source-${index}`}>
    <td className="border p-2">
      <input
        type="text"
        className="w-full p-1 border rounded"
        value={row.source}
        onChange={(e) => handleTableUpdate(index, 'source', e.target.value)}
        placeholder={`Source ${index + 1}`}
      />
    </td>
    {['targetUsers', 'arpu', 'revenue', 'directCosts', 'grossMargin', 'grossProfit'].map((field) => (
      <td key={field} className="border p-2">
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={row[field]}
          placeholder="0.00"
          onChange={(e) => {
            const value = e.target.value;
            if (validateNumericInput(value, ['targetUsers', 'arpu', 'directCosts'].includes(field))) {
              handleTableUpdate(index, field, value);
            }
          }}
          readOnly={field === 'grossMargin' || field === 'grossProfit' || field === 'revenue'}
        />
      </td>
    ))}
  </tr>
))}
  {/* Miscellaneous Row */}
  {/* Miscellaneous Row */}
  <tr className="bg-gray-100">
  <td className="border p-2 flex items-center justify-between">
    Miscellaneous
    <button 
      onClick={toggleMiscRows}
      className="p-1 hover:bg-gray-100 rounded-full"
    >
      <Edit className="h-4 w-4" />
    </button>
  </td>
  {['targetUsers', 'arpu', 'revenue', 'directCosts', 'grossMargin', 'grossProfit'].map((field) => (
    <td key={field} className="border p-2">
      {calculateMiscTotals(tempMiscRows)[field]}
    </td>
  ))}
</tr>

  {/* Total Row */}
  <tr className="font-bold bg-gray-50">
    <td className="border p-2">Total</td>
    {['targetUsers', 'arpu', 'revenue', 'directCosts', 'grossMargin', 'grossProfit'].map((field) => (
      <td key={field} className="border p-2">
        {calculateTotals(tempTableData, tempMiscRows)[field]}
      </td>
    ))}
  </tr>
</tbody>


                  </table>
                </div>
                <div className="w-1/3 ml-4">
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter description of revenue model..."
                    className="w-full p-3 border rounded-lg h-full resize-none"
                  />
                </div>
              </div>

              {/* Additional Rows (when enabled) - Now matches main table width */}
              {/* Additional Rows (when enabled) - Now matches main table width */}
{showMiscRows && (
  <div className="w-2/3">
    <table className="w-full border-collapse bg-white mt-4">
      <thead>
        <tr>
          <th className="border p-2 bg-[#527853] text-white">Source</th>
          <th className="border p-2 bg-[#527853] text-white">Target Users</th>
          <th className="border p-2 bg-[#527853] text-white">ARPU/Year</th>
          <th className="border p-2 bg-[#527853] text-white">Revenue</th>
          <th className="border p-2 bg-[#527853] text-white">Direct Costs %</th>
          <th className="border p-2 bg-[#527853] text-white">Gross Margin%</th>
          <th className="border p-2 bg-[#527853] text-white">Gross Profit</th>
        </tr>
      </thead>
      <tbody>
      {tempMiscRows.map((row, index) => (
  <tr key={`misc-${index}`}>
    <td className="border p-2" style={{ width: '14.28%' }}>
      <input
        type="text"
        className="w-full p-1 border rounded"
        value={row.source}
        onChange={(e) => handleTableUpdate(index, 'source', e.target.value, true)}
      />
    </td>
    {['targetUsers', 'arpu', 'revenue', 'directCosts', 'grossMargin', 'grossProfit'].map((field) => (
      <td key={field} className="border p-2" style={{ width: '14.28%' }}>
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={row[field]}
          placeholder={field === 'targetUsers' ? '0.0' : '0.00'} // Added placeholder
          onChange={(e) => {
            const value = e.target.value;
            if (validateNumericInput(value, ['targetUsers', 'arpu', 'directCosts'].includes(field))) {
              handleTableUpdate(index, field, value, true);
            }
          }}
          readOnly={field === 'grossMargin' || field === 'grossProfit' || field === 'revenue'}
        />
      </td>
    ))}
  </tr>
))}
      </tbody>
    </table>
  </div>
)}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* In the render section, update the Volume Potential chart */}
<div>
  <h4 className="text-center font-medium text-[#527853]">VOLUME POTENTIAL</h4>
  <BarChart width={350} height={300} data={calculateChartData()}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year" />
    <YAxis domain={[0, 'auto']} /> {/* Add domain prop */}
    <Tooltip />
    <Bar dataKey="targetUsers" fill="#527853" name="Volume" />
  </BarChart>
</div>

          <div>
            <h4 className="text-center font-medium text-[#527853]">REVENUE POTENTIAL</h4>
            <BarChart width={350} height={300} data={calculateChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#527853" name="Revenue" />
            </BarChart>
          </div>

          <div>
            <h4 className="text-center font-medium text-[#527853]">GROSS PROFIT</h4>
            <ComposedChart width={350} height={300} data={calculateChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar dataKey="grossProfit" fill="#527853" yAxisId="left" name="GP" />
              <Line type="monotone" dataKey="grossMargin" stroke="#8884d8" yAxisId="right" name="%" />
            </ComposedChart>
          </div>
        </div>
      </div>
      {isDirty && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Slide5;