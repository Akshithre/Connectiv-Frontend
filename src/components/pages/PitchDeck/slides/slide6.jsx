import React, { useState, useEffect } from 'react';
import { Edit, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart } from 'recharts';
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Helper Functions
const validateData = (data) => {
  return data && typeof data === 'object' && !Array.isArray(data);
};

const transformYearlyData = (yearlyData) => {
  const transformedData = {
    volume: {},
    revenue: {},
    grossProfit: {}
  };

  Object.entries(yearlyData || {}).forEach(([yearKey, yearData]) => {
    const year = yearKey.split('-')[1];
    
    const mainSourceTotals = yearData.mainSources?.reduce((acc, source) => ({
      volume: (acc.volume || 0) + (parseFloat(source.targetUsers) || 0),
      revenue: (acc.revenue || 0) + (parseFloat(source.revenue) || 0),
      grossProfit: (acc.grossProfit || 0) + (parseFloat(source.grossProfit) || 0)
    }), {}) || { volume: 0, revenue: 0, grossProfit: 0 };

    const miscSourceTotals = yearData.miscSources?.reduce((acc, source) => ({
      volume: (acc.volume || 0) + (parseFloat(source.targetUsers) || 0),
      revenue: (acc.revenue || 0) + (parseFloat(source.revenue) || 0),
      grossProfit: (acc.grossProfit || 0) + (parseFloat(source.grossProfit) || 0)
    }), {}) || { volume: 0, revenue: 0, grossProfit: 0 };

    transformedData.volume[year] = mainSourceTotals.volume + miscSourceTotals.volume;
    transformedData.revenue[year] = mainSourceTotals.revenue + miscSourceTotals.revenue;
    transformedData.grossProfit[year] = mainSourceTotals.grossProfit + miscSourceTotals.grossProfit;
  });

  return transformedData;
};

const extractYears = (yearlyData) => {
  const yearSet = new Set();
  Object.keys(yearlyData || {}).forEach(yearKey => {
    const year = yearKey.split('-')[1];
    yearSet.add(year);
  });
  return Array.from(yearSet).sort();
};

const retryFetch = async (fetchFunction, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Base Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
// Cost Breakdown Modal Component
const CostBreakdownModal = ({ isOpen, onClose, title, data, onSave, years }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleInputChange = (rowIndex, field, value) => {
    const newData = [...localData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: value
    };
    setLocalData(newData);
  };

  const validateNumericInput = (value) => {
    return value === '' || /^\d*\.?\d*$/.test(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title} Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">Item</th>
                {years.map(year => (
                  <th key={year} className="border p-2 text-center">{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localData.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-left"
                      value={row.title || ''}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      placeholder={`${title} ${index + 1}`}
                    />
                  </td>
                  {years.map(year => (
                    <td key={year} className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 border rounded text-center"
                        value={row[year] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (validateNumericInput(value)) {
                            handleInputChange(index, year, value);
                          }
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => onSave(localData)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Custom KPI Modal Component
const CustomKPIModal = ({ isOpen, onClose, data, onSave, years }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleInputChange = (index, field, value) => {
    const newData = [...localData];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    setLocalData(newData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom KPIs</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">KPI</th>
                <th className="border p-2 text-center">Unit</th>
                {years.map(year => (
                  <th key={year} className="border p-2 text-center">{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localData.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-center"
                      value={row.name || ''}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      placeholder={`KPI ${index + 1}`}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-center"
                      value={row.unit || ''}
                      onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                    />
                  </td>
                  {years.map(year => (
                    <td key={year} className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 border rounded text-center"
                        value={row[year] || ''}
                        onChange={(e) => handleInputChange(index, year, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => onSave(localData)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
// Main Slide6 Component
const Slide6 = () => {
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  const { getSlideData, updateSlideData } = usePitchDeck();

  // State declarations
  const [employeeCosts, setEmployeeCosts] = useState(Array(10).fill().map(() => ({})));
  const [otherCosts, setOtherCosts] = useState(Array(10).fill().map(() => ({})));
  const [showEmployeeCostsModal, setShowEmployeeCostsModal] = useState(false);
  const [showOtherCostsModal, setShowOtherCostsModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [slide5Data, setSlide5Data] = useState(null);
  const [mainData, setMainData] = useState({
    volume: {},
    revenue: {},
    grossProfit: {}
  });
  const [customKPIs, setCustomKPIs] = useState(Array(6).fill().map(() => ({}))); 
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState(null);
  const [years, setYears] = useState([]);

  // Processing functions
  const processSlide5Data = (data) => {
    if (!data) return;
    
    setSlide5Data(data);
    const transformedData = transformYearlyData(data.yearlyData);
    setMainData(transformedData);
    setYears(extractYears(data.yearlyData));
  };

  const processEmployeeCosts = (profitEstimates) => {
    const employeeCostsData = profitEstimates?.find(
      item => item.name === 'Employee Costs'
    );
    if (employeeCostsData?.values) {
      const newEmployeeCosts = Array(10).fill().map(() => ({}));
      if (Object.keys(employeeCostsData.values).length > 0) {
        newEmployeeCosts[0] = {
          title: 'Employee Cost 1',
          ...employeeCostsData.values
        };
      }
      setEmployeeCosts(newEmployeeCosts);
    }
  };

  const processOtherCosts = (profitEstimates) => {
    const otherCostsData = profitEstimates?.find(
      item => item.name === 'Other Costs'
    );
    if (otherCostsData?.values) {
      const newOtherCosts = Array(10).fill().map(() => ({}));
      if (Object.keys(otherCostsData.values).length > 0) {
        newOtherCosts[0] = {
          title: 'Other Cost 1',
          ...otherCostsData.values
        };
      }
      setOtherCosts(newOtherCosts);
    }
  };

  const processCustomKPIs = (kpiMetrics) => {
    if (kpiMetrics) {
      const customKPIData = kpiMetrics
        .filter(kpi => !['Volume', 'ARPU', 'GM', 'Cost Efficiency'].includes(kpi.name))
        .map(kpi => ({
          name: kpi.name,
          unit: kpi.unit,
          ...kpi.values
        }));

      setCustomKPIs([
        ...customKPIData,
        ...Array(6 - customKPIData.length).fill().map(() => ({}))
      ]);
    }
  };

  const processSlide6Data = (data) => {
    if (!data) return;
    
    processEmployeeCosts(data.profitEstimates);
    processOtherCosts(data.profitEstimates);
    processCustomKPIs(data.kpiMetrics);
  };

  // Fetch functions
  const fetchSlide5Data = async () => {
    try {
      const response = await retryFetch(async () => 
        fetch(`${API_BASE_URL}/api/business-proposal/get-slide5/${proposalId}`)
      );
      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 5 data');
      }

      if (!validateData(data.data)) {
        throw new Error('Invalid data structure received for Slide 5');
      }

      const proposalData = data.data;
      processSlide5Data(proposalData.slide5);
      
      // Update context
      await updateSlideData(5, proposalData.slide5);

    } catch (error) {
      console.error('Error fetching Slide 5 data:', error);
      setError(error.message);
    }
  };

  const fetchSlide6Data = async () => {
    try {
      const response = await retryFetch(async () => 
        fetch(`${API_BASE_URL}/api/business-proposal/get-slide6/${proposalId}`)
      );
      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 6 data');
      }

      const proposalData = data.data;
      if (!proposalData?.slide6) return;

      processSlide6Data(proposalData.slide6);
      
      // Update context
      await updateSlideData(6, proposalData.slide6);

    } catch (error) {
      console.error('Error fetching Slide 6 data:', error);
      setError(error.message);
    }
  };

  // Calculation functions
  const calculateTotalCosts = (costs, year) => {
    return costs.reduce((sum, cost) => sum + (Number(cost[year]) || 0), 0);
  };

  const calculateEBITDA = (year) => {
    const grossProfit = Number(mainData.grossProfit?.[year]) || 0;
    const empCosts = calculateTotalCosts(employeeCosts, year);
    const othCosts = calculateTotalCosts(otherCosts, year);
    return grossProfit - empCosts - othCosts;
  };

  const calculateEBITDAPercentage = (year) => {
    const ebitda = calculateEBITDA(year);
    const revenue = Number(mainData.revenue?.[year]) || 1;
    return ((ebitda / revenue) * 100).toFixed(2);
  };

  const calculateCAGR = (startValue, endValue, numYears) => {
    startValue = parseFloat(startValue);
    endValue = parseFloat(endValue);
    
    if (!startValue || !endValue || startValue <= 0 || endValue <= 0 || !numYears) {
      return '0.00';
    }
  
    // CAGR = ((End Value / Start Value)^(1/n) - 1) * 100
    // where n is the number of years between start and end years
    const cagr = (Math.pow(endValue / startValue, 1/numYears) - 1) * 100;
    return cagr.toFixed(2);
  };
  const calculateAutoKPIs = () => {
    return [
      {
        name: 'Volume',
        unit: 'Users',
        ...years.reduce((acc, year) => ({
          ...acc,
          [year]: mainData.volume?.[year] ? mainData.volume[year].toFixed(2) : '0.00'
        }), {})
      },
      {
        name: 'ARPU',
        unit: 'INR',
        ...years.reduce((acc, year) => ({
          ...acc,
          [year]: mainData.revenue?.[year] && mainData.volume?.[year] && mainData.volume[year] !== 0
            ? (mainData.revenue[year] / mainData.volume[year]).toFixed(2)
            : '0.00'
        }), {})
      },
      {
        name: 'GM',
        unit: '%',
        ...years.reduce((acc, year) => ({
          ...acc,
          [year]: mainData.grossProfit?.[year] && mainData.revenue?.[year] && mainData.revenue[year] !== 0
            ? ((mainData.grossProfit[year] / mainData.revenue[year]) * 100).toFixed(2)
            : '0.00'
        }), {})
      },
      {
        name: 'Cost Efficiency',
        unit: '%',
        ...years.reduce((acc, year) => ({
          ...acc,
          [year]: mainData.revenue?.[year] && mainData.revenue[year] !== 0
            ? (((calculateTotalCosts(employeeCosts, year) + calculateTotalCosts(otherCosts, year)) / 
                mainData.revenue[year]) * 100).toFixed(2)
            : '0.00'
        }), {})
      }
    ];
  };

  const getChartData = () => {
    return years.map(year => ({
      year,
      revenue: parseFloat(mainData.revenue?.[year]) || 0,
      ebitda: calculateEBITDA(year),
      ebitdaMargin: parseFloat(calculateEBITDAPercentage(year)) || 0
    }));
  };

  const calculateEmployeeCostsTotal = () => {
    const filledEmployeeCosts = employeeCosts.filter(cost => 
      cost.title && Object.keys(cost).some(key => key !== 'title' && cost[key])
    );

    return years.reduce((acc, year) => ({
      ...acc,
      [year]: filledEmployeeCosts.reduce((sum, cost) => sum + (Number(cost[year]) || 0), 0).toString()
    }), {});
  };

  const calculateOtherCostsTotal = () => {
    const filledOtherCosts = otherCosts.filter(cost => 
      cost.title && Object.keys(cost).some(key => key !== 'title' && cost[key])
    );

    return years.reduce((acc, year) => ({
      ...acc,
      [year]: filledOtherCosts.reduce((sum, cost) => sum + (Number(cost[year]) || 0), 0).toString()
    }), {});
  };

  const getFilledCustomKPIs = () => {
    return customKPIs
      .filter(kpi => kpi.name && kpi.unit)
      .map(kpi => ({
        name: kpi.name,
        unit: kpi.unit,
        values: years.reduce((acc, year) => ({
          ...acc,
          [year]: (kpi[year] || '0').toString()
        }), {})
      }));
  };

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to get data from context first
        const slide5FromContext = getSlideData(5);
        const slide6FromContext = getSlideData(6);

        if (Object.keys(slide5FromContext).length && Object.keys(slide6FromContext).length) {
          // Use context data if available
          processSlide5Data(slide5FromContext);
          processSlide6Data(slide6FromContext);
        } else {
          // Fetch from backend if not in context
          await Promise.all([
            fetchSlide5Data(),
            fetchSlide6Data()
          ]);
        }
      } catch (error) {
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) {
      loadData();
    }
  }, [proposalId]);

  // Save function
  // Inside Slide6 component
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Get all auto-calculated KPIs with their values
      const autoKPIs = calculateAutoKPIs().map(kpi => ({
        name: kpi.name,
        unit: kpi.unit,
        values: years.reduce((acc, year) => ({
          ...acc,
          [year]: kpi[year]
        }), {})
      }));
  
      // Get filled custom KPIs
      const customKPIData = customKPIs
        .filter(kpi => kpi.name && kpi.unit)
        .map(kpi => ({
          name: kpi.name,
          unit: kpi.unit,
          values: years.reduce((acc, year) => ({
            ...acc,
            [year]: (kpi[year] || '0').toString()
          }), {})
        }));
  
      const transformedData = {
        proposalId,
        profitEstimates: [
          {
            name: 'Employee Costs',
            values: calculateEmployeeCostsTotal()
          },
          {
            name: 'Other Costs',
            values: calculateOtherCostsTotal()
          }
        ],
        kpiMetrics: [...autoKPIs, ...customKPIData] // Combine auto and custom KPIs
      };
  
      // Update backend
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide6`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });
  
      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to save data');
      }
  
      // Update context after successful save
      await updateSlideData(6, transformedData);
      
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
      console.error('Error saving data:', error);
      setError(error.message || 'Failed to save changes');
      toast.error(error.message || 'Failed to save changes', {
        toastId: 'save-error'
      });
    } finally {
      setIsLoading(false);
    }
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
      const currentSlideData = document.querySelector(`[data-slide="6"]`);
      
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
    <div className="h-full relative" data-slide="6" data-is-dirty={isDirty.toString()}>
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
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-lg font-medium text-gray-600">Loading...</div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <span className="mr-2">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Profit Estimates and KPIs
          </h2>
        </div>

        <div className="p-6">
          {/* Main Data Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-center">INRk</th>
                  {years.map(year => (
                    <th key={year} className="border p-2 text-center">{year}</th>
                  ))}
                  <th className="border p-2 text-center">5Y CAGR</th>
                </tr>
              </thead>
              <tbody>
                {/* Volume row */}
                <tr>
                  <td className="border p-2">Volume (Users)</td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {mainData.volume?.[year]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      mainData.volume?.[years[0]],
                      mainData.volume?.[years[years.length - 1]],
                      years.length - 1
                    )}%
                  </td>
                </tr>

                {/* Revenue row */}
                <tr>
                  <td className="border p-2">Revenue</td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {mainData.revenue?.[year]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      mainData.revenue?.[years[0]],
                      mainData.revenue?.[years[years.length - 1]],
                      years.length - 1
                    )}%
                  </td>
                </tr>

                {/* Gross Profit row */}
                <tr>
                  <td className="border p-2">Gross Profit</td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {mainData.grossProfit?.[year]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      mainData.grossProfit?.[years[0]],
                      mainData.grossProfit?.[years[years.length - 1]],
                      years.length - 1
                    )}%
                  </td>
                </tr>

                {/* Employee Costs row */}
                <tr>
                  <td className="border p-2 flex items-center justify-between">
                    Employee Costs
                    <button 
                      onClick={() => setShowEmployeeCostsModal(true)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {calculateTotalCosts(employeeCosts, year).toFixed(2)}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      calculateTotalCosts(employeeCosts, years[0]),
                      calculateTotalCosts(employeeCosts, years[years.length - 1]),
                      years.length - 1
                    )}%
                  </td>
                </tr>

                {/* Other Costs row */}
                <tr>
                  <td className="border p-2 flex items-center justify-between">
                    Other Costs
                    <button 
                      onClick={() => setShowOtherCostsModal(true)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {calculateTotalCosts(otherCosts, year).toFixed(2)}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      calculateTotalCosts(otherCosts, years[0]),
                      calculateTotalCosts(otherCosts, years[years.length - 1]),
                      years.length - 1
                    )}%
                  </td>
                </tr>

                {/* EBITDA row */}
                <tr>
                  <td className="border p-2 font-medium">EBITDA</td>
                  {years.map(year => (
                    <td key={year} className="border p-2 text-center">
                      {calculateEBITDA(year).toFixed(2)}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {calculateCAGR(
                      calculateEBITDA(years[0]),
                      calculateEBITDA(years[years.length - 1]),
                      years.length - 1
                    )}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* KPI Table */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Key Performance Indicators</h3>
              <button 
                onClick={() => setShowKPIModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Add Custom KPIs</span>
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-center">KPI</th>
                  <th className="border p-2 text-center">Unit</th>
                  {years.map(year => (
                    <th key={year} className="border p-2 text-center">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Auto-calculated KPIs */}
                {calculateAutoKPIs().map((kpi, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{kpi.name}</td>
                    <td className="border p-2 text-center">{kpi.unit}</td>
                    {years.map(year => (
                      <td key={year} className="border p-2 text-center">
                        {kpi.unit === '%' ? `${kpi[year]}%` : kpi[year]}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Custom KPIs */}
                {customKPIs.filter(kpi => kpi.name).map((kpi, index) => (
                  <tr key={`custom-${index}`}>
                    <td className="border p-2 text-center">{kpi.name}</td>
                    <td className="border p-2 text-center">{kpi.unit}</td>
                    {years.map(year => (
                      <td key={year} className="border p-2 text-center">
                        {kpi[year] || '0.00'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-center font-medium text-green-800 mb-4">
                REVENUE POTENTIAL
              </h4>
              <BarChart width={400} height={300} data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
              </BarChart>
            </div>

            <div>
              <h4 className="text-center font-medium text-green-800 mb-4">
                EBITDA & MARGIN
              </h4>
              <ComposedChart width={400} height={300} data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar dataKey="ebitda" fill="#82ca9d" yAxisId="left" name="EBITDA" />
                <Line 
                  type="monotone" 
                  dataKey="ebitdaMargin" 
                  stroke="#8884d8" 
                  yAxisId="right" 
                  name="EBITDA Margin"
                />
              </ComposedChart>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CostBreakdownModal
        isOpen={showEmployeeCostsModal}
        onClose={() => setShowEmployeeCostsModal(false)}
        title="Employee Costs"
        data={employeeCosts}
        onSave={(data) => {
          setEmployeeCosts(data);
          setShowEmployeeCostsModal(false);
          setIsDirty(true);
        }}
        years={years}
      />

      <CostBreakdownModal
        isOpen={showOtherCostsModal}
        onClose={() => setShowOtherCostsModal(false)}
        title="Other Costs"
        data={otherCosts}
        onSave={(data) => {
          setOtherCosts(data);
          setShowOtherCostsModal(false);
          setIsDirty(true);
        }}
        years={years}
      />

      <CustomKPIModal
        isOpen={showKPIModal}
        onClose={() => setShowKPIModal(false)}
        data={customKPIs}
        onSave={(data) => {
          setCustomKPIs(data);
          setShowKPIModal(false);
          setIsDirty(true);
        }}
        years={years}
      />

      {isDirty && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Slide6;