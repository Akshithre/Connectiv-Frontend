import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ListFilter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePitchDeck } from '../context/PitchDeckContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_KPIS = ['Volume', 'ARPU', 'GM', 'Cost Efficiency'];

const Slide7 = () => {
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  const { getSlideData, updateSlideData } = usePitchDeck();

  const [selectedKPIs, setSelectedKPIs] = useState(DEFAULT_KPIS);
  const [chartTypes, setChartTypes] = useState({});
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchSlide6Data = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide6/${proposalId}`);
      const data = await response.json();
  
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 6 data');
      }
  
      if (!data.data?.slide6) {
        return {
          chartData: [],
          kpiNames: DEFAULT_KPIS
        };
      }
  
      const kpiMetrics = data.data.slide6.kpiMetrics || [];
      if (kpiMetrics.length === 0) {
        return {
          chartData: [],
          kpiNames: DEFAULT_KPIS
        };
      }
  
      const years = Object.keys(kpiMetrics[0].values || {}).sort();
      const chartData = years.map(year => {
        const dataPoint = { year };
        kpiMetrics.forEach(kpi => {
          dataPoint[kpi.name] = parseFloat(kpi.values[year]) || 0;
        });
        return dataPoint;
      });
  
      return {
        chartData,
        kpiNames: [...new Set([...DEFAULT_KPIS, ...kpiMetrics.map(kpi => kpi.name)])]
      };
    } catch (error) {
      console.error('Error fetching Slide 6 data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!proposalId || dataLoaded) return;

      try {
        setIsLoading(true);
        
        // First try to get data from context
        const savedData = getSlideData(7);
        if (Object.keys(savedData).length > 0) {
          const content = savedData.content || [];
          const savedKPIs = content.map(item => item.text);
          const savedChartTypes = content.reduce((acc, item) => ({
            ...acc,
            [item.text]: item.bar_or_line || 'bar'
          }), {});

          setSelectedKPIs(savedKPIs);
          setChartTypes(savedChartTypes);
          
          // Still need to fetch chart data from Slide 6
          const slide6Data = await fetchSlide6Data();
          setChartData(slide6Data.chartData || []);
          
          setDataLoaded(true);
          setIsLoading(false);
          return;
        }

        // If no context data, fetch from backend
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide7/${proposalId}`);
        const data = await response.json();

        if (!data.status) {
          throw new Error(data.message || 'Failed to fetch Slide 7 data');
        }

        const slide7Data = data.data?.slide7?.content || [];
        
        if (slide7Data.length > 0) {
          const savedKPIs = slide7Data.map(item => item.text);
          const savedChartTypes = slide7Data.reduce((acc, item) => ({
            ...acc,
            [item.text]: item.bar_or_line || 'bar'
          }), {});

          setSelectedKPIs(savedKPIs);
          setChartTypes(savedChartTypes);
        } else {
          // Set defaults if no data
          setSelectedKPIs(DEFAULT_KPIS);
          setChartTypes(DEFAULT_KPIS.reduce((acc, kpi) => ({
            ...acc,
            [kpi]: 'bar'
          }), {}));
        }

        const slide6Data = await fetchSlide6Data();
        setChartData(slide6Data.chartData || []);

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load slide data', {
          toastId: 'load-error'
        });
        
        setSelectedKPIs(DEFAULT_KPIS);
        setChartTypes(DEFAULT_KPIS.reduce((acc, kpi) => ({
          ...acc,
          [kpi]: 'bar'
        }), {}));
      } finally {
        setIsLoading(false);
        setDataLoaded(true);
      }
    };

    loadData();
  }, [proposalId, getSlideData, dataLoaded]);

  const handleSave = async () => {
    if (!proposalId) {
      toast.error('No proposal ID found', {
        toastId: 'no-proposal-id'
      });
      return;
    }

    try {
      setIsLoading(true);

      const transformedContent = selectedKPIs.map(kpi => ({
        text: kpi,
        bar_or_line: chartTypes[kpi] || 'bar'
      }));

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide7`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          content: transformedContent
        })
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      setIsDirty(false);
      updateSlideData(7, { content: transformedContent });
      
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
      toast.error(error.message || 'Failed to save changes', {
        toastId: 'save-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component code remains the same...
  const allKPIs = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return DEFAULT_KPIS;
    }
    return [...new Set([...DEFAULT_KPIS, ...Object.keys(chartData[0] || {}).filter(key => key !== 'year')])];
  }, [chartData]);

  const handleKPIChange = (kpi) => {
    if (!kpi) return;
    
    setSelectedKPIs(prev => {
      let newSelection;
      if (prev.includes(kpi)) {
        newSelection = prev.filter(k => k !== kpi);
      } else {
        if (prev.length < 4) {
          newSelection = [...prev, kpi];
        } else {
          toast.error('Please deselect a KPI first. Maximum 4 KPIs can be shown at once.', {
            toastId: 'kpi-limit'
          });
          return prev;
        }
      }
      setIsDirty(true);
      return newSelection;
    });
  
    if (!chartTypes[kpi]) {
      setChartTypes(prev => ({
        ...prev,
        [kpi]: 'bar'
      }));
    }
  };

  const handleChartTypeChange = (kpi, type) => {
    setChartTypes(prev => {
      const newTypes = { ...prev, [kpi]: type };
      setIsDirty(true);
      return newTypes;
    });
  };

  const colors = {
    Volume: '#527853',
    ARPU: '#527853',
    EBITDA: '#527853',
    GM: '#527853',
    'Operating Margin': '#527853',
    'Net Profit': '#527853',
    'Cost Efficiency': '#527853'
  };

  return (
    <div className="h-full relative" data-slide="7" data-is-dirty={isDirty.toString()}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 p-4">
        <div className="w-full border-2 border-black-900 rounded-lg bg-white">
          <div className="bg-[#527853] p-4">
            <h2 className="text-white text-center text-xl font-medium">
              Charts for all the custom KPIs
            </h2>
          </div>

          <div className="p-6">
            {/* KPI Selection Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ListFilter className="h-5 w-5 text-[#527853]" />
                <span className="font-medium">Select KPIs (max 4):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allKPIs.map(kpi => {
                  const isDefault = DEFAULT_KPIS.includes(kpi);
                  const isSelected = selectedKPIs.includes(kpi);
                  
                  return (
                    <button
                      key={kpi}
                      onClick={() => handleKPIChange(kpi)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#527853] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } ${
                        isDefault && !isSelected ? 'border-2 border-[#527853]' : ''
                      }`}
                    >
                      {kpi}
                      {isDefault && !isSelected && ' (Default)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Charts Section */}
            {chartData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No data available. Please add KPIs in Slide 6 first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedKPIs.map(kpi => (
                  <div key={kpi} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg text-[#527853]">{kpi}</h3>
                      <select
                        value={chartTypes[kpi]}
                        onChange={(e) => handleChartTypeChange(kpi, e.target.value)}
                        className="px-3 py-1 border rounded-full text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#527853]"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                      </select>
                    </div>
                    <div className="h-64">
                      {chartTypes[kpi] === 'bar' ? (
                        <BarChart 
                          width={400} 
                          height={250} 
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Bar 
                            dataKey={kpi} 
                            fill={colors[kpi] || '#527853'} 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <LineChart 
                          width={400} 
                          height={250} 
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey={kpi} 
                            stroke={colors[kpi] || '#527853'} 
                            strokeWidth={2}
                            dot={{ fill: colors[kpi] || '#527853' }}
                          />
                        </LineChart>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isDirty && (
          <div className="fixed bottom-4 right-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              data-save-button
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slide7;