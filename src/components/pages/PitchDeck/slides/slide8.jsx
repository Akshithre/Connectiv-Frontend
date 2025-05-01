import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { usePitchDeck } from '../context/PitchDeckContext';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const EditableTextBox = ({ title, value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="space-y-2">
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      <div className="bg-gray-100 rounded-lg relative">
        <div className="absolute top-3 right-3">
          <button onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        {isEditing ? (
          <textarea
            className="w-full p-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            rows={4}
            placeholder={`Enter ${title.toLowerCase()} details...`}
          />
        ) : (
          <div className="p-4 min-h-[100px]">
            <p className="text-gray-600 pr-8">
              {value || `Enter ${title.toLowerCase()} details...`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DynamicPieChart = ({ data, title }) => {
  const COLORS = ['#86efac', '#22c55e', '#15803d'];

  return (
    <div>
      <h3 className="text-[#527853] text-sm font-semibold mb-2 whitespace-pre-line">{title}</h3>
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <span>{item.name}, {Math.round(item.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FCFBarChart = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="year"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
            formatter={(value) => [`${value.toFixed(1)}`, 'Value']}
          />
          <Bar
            dataKey="value"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? '#22c55e' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Slide8 = () => {
  const { updateSlideData, getSlideData, proposalId } = usePitchDeck();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [yearHeaders, setYearHeaders] = useState([]);
  const [slide5Years, setSlide5Years] = useState({
    startYear: null,
    startMonth: null,
    targetYear: null
  });
  // Initialize state
  const [tableData, setTableData] = useState({
    EBITDA: Array(5).fill(''),
    'W.Capital': Array(5).fill(''),
    Taxes: Array(5).fill(''),
    OCF: Array(5).fill(''),
    Capex: Array(5).fill(''),
    FCF: Array(5).fill('')
  });
  const [workingCapital, setWorkingCapital] = useState('');
  const [capex, setCapex] = useState('');
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [fcfChartData, setFcfChartData] = useState([]);
  const [yearOnePieData, setYearOnePieData] = useState([]);
  const [fiveYearPieData, setFiveYearPieData] = useState([]);

  // Fetch data
  const fetchSlide5Years = async () => {
    if (!proposalId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide5/${proposalId}`);
      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 5 data');
      }

      if (data.data?.slide5) {
        const { revenueStartYear, revenueStartMonth, revenueTargetYear } = data.data.slide5;
        
        setSlide5Years({
          startYear: revenueStartYear,
          startMonth: revenueStartMonth,
          targetYear: revenueTargetYear
        });

        // Generate year headers
        if (revenueStartYear && revenueTargetYear) {
          const years = [];
          for (let year = revenueStartYear; year <= revenueTargetYear; year++) {
            const monthPrefix = revenueStartMonth ? 
              String(revenueStartMonth).padStart(2, '0') + '-' : '';
            years.push(`${monthPrefix}${year}`);
          }
          setYearHeaders(years);
        }
      }
    } catch (error) {
      console.error('Error fetching Slide 5 data:', error);
      setError('Failed to fetch year data from Slide 5');
    }
  };


  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!proposalId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Slide 5 data first
        await fetchSlide5Years();

        // Then fetch Slide 8 data
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide8/${proposalId}`);
        const data = await response.json();

        if (!data.status) {
          throw new Error(data.message || 'Failed to fetch data');
        }

        if (data.data?.slide8) {
          const { slide8 } = data.data;
          
          const transformedTableData = {
            EBITDA: Array(5).fill(''),
            'W.Capital': Array(5).fill(''),
            Taxes: Array(5).fill(''),
            OCF: Array(5).fill(''),
            Capex: Array(5).fill(''),
            FCF: Array(5).fill('')
          };

          slide8.cashEstimates?.forEach(item => {
            const row = item.name;
            Object.entries(item.values).forEach(([key, value]) => {
              const colIndex = parseInt(key.slice(1)) - 1;
              transformedTableData[row][colIndex] = value;
            });
          });

          setTableData(transformedTableData);
          setWorkingCapital(slide8.workingCapital || '');
          setCapex(slide8.capex || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [proposalId]);

  // Save data
  const handleSave = async () => {
    if (!proposalId) return;

    setIsLoading(true);
    try {
      const cashEstimates = Object.keys(tableData).map(name => ({
        name,
        values: tableData[name].reduce((acc, value, index) => ({
          ...acc,
          [`Y${index + 1}`]: value.toString()
        }), {})
      }));

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          cashEstimates,
          workingCapital,
          capex
        })
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to save data');
      }

      setIsDirty(false);
      toast.dismiss();
      toast.success('Changes saved successfully!', {
        toastId: 'save-success',
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        style: {
          background: '#17843f',
          color: 'white',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message || 'Failed to save data');
      toast.dismiss();
      toast.error('Failed to save changes', {
        toastId: 'save-error',
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived data
  useEffect(() => {
    const fcfData = tableData['FCF'].map((value, index) => ({
      year: yearHeaders[index] || `Y${index + 1}`,
      value: parseFloat(value) || 0
    }));

    const y1Capex = Math.abs(parseFloat(tableData['Capex'][0])) || 0;
    const y1Taxes = Math.abs(parseFloat(tableData['Taxes'][0])) || 0;
    const y1WCapital = Math.abs(parseFloat(tableData['W.Capital'][0])) || 0;
    const y1Total = y1Capex + y1Taxes + y1WCapital;

    const yearOneData = [
      { name: 'Capex', value: y1Capex, percentage: (y1Capex / y1Total) * 100 || 0 },
      { name: 'Taxes', value: y1Taxes, percentage: (y1Taxes / y1Total) * 100 || 0 },
      { name: 'Trade Wcap', value: y1WCapital, percentage: (y1WCapital / y1Total) * 100 || 0 }
    ].filter(item => item.value > 0);

    // Calculate five year totals
    const totalCapex = tableData['Capex'].reduce((sum, val) => sum + (Math.abs(parseFloat(val)) || 0), 0);
    const totalTaxes = tableData['Taxes'].reduce((sum, val) => sum + (Math.abs(parseFloat(val)) || 0), 0);
    const totalWCapital = tableData['W.Capital'].reduce((sum, val) => sum + (Math.abs(parseFloat(val)) || 0), 0);
    const fiveYearTotal = totalCapex + totalTaxes + totalWCapital;

    const fiveYearData = [
      { name: 'Capex', value: totalCapex, percentage: (totalCapex / fiveYearTotal) * 100 || 0 },
      { name: 'Taxes', value: totalTaxes, percentage: (totalTaxes / fiveYearTotal) * 100 || 0 },
      { name: 'Trade Wcap', value: totalWCapital, percentage: (totalWCapital / fiveYearTotal) * 100 || 0 }
    ].filter(item => item.value > 0);

    setFcfChartData(fcfData);
    setYearOnePieData(yearOneData);
    setFiveYearPieData(fiveYearData);
  }, [tableData, yearHeaders]);

  // Event handlers
  const handleCellEdit = (row, col, value) => {
    setTableData(prev => {
      const newData = { ...prev };
      newData[row][col] = value;
      return newData;
    });
    setIsDirty(true);
  };

  const handleWorkingCapitalChange = (value) => {
    setWorkingCapital(value);
    setIsDirty(true);
  };

  const handleCapexChange = (value) => {
    setCapex(value);
    setIsDirty(true);
  };

  const calculateTotalSpend = (data) => {
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white relative" data-slide="8" data-is-dirty={isDirty.toString()}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-lg font-medium text-gray-600">Loading...</div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <span className="mr-2">{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">×</button>
          </div>
        </div>
      )}

<div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#527853] text-xl font-semibold">Cash Estimates</h2>
              <button 
                onClick={() => setIsTableEditing(!isTableEditing)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="border-2 border-[#527853] p-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-gray-100 p-3 w-40"></th>
                    {yearHeaders.length > 0 ? (
                      yearHeaders.map(year => (
                        <th key={year} className="bg-gray-100 p-3 w-32 text-center">
                          {year}
                        </th>
                      ))
                    ) : (
                      ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map(year => (
                        <th key={year} className="bg-gray-100 p-3 w-32 text-center">
                          {year}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(tableData).map(row => (
                    <tr key={row}>
                      <td className="bg-gray-100 p-3 font-medium">
                        {row === 'W.Capital' ? '(-) W.Capital' : 
                         row === 'Taxes' ? '(-) Taxes' :
                         row === 'Capex' ? '(-) Capex' : row}
                      </td>
                      {[0, 1, 2, 3, 4].map(col => (
                        <td key={col} className="border p-3">
                          {isTableEditing ? (
                            <input
                              type="number"
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={tableData[row][col]}
                              onChange={(e) => handleCellEdit(row, col, e.target.value)}
                            />
                          ) : (
                            <span>{tableData[row][col]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Working Capital and Capex Sections */}
          <div className="space-y-6">
            <EditableTextBox
              title="Working Capital"
              value={workingCapital}
              onChange={handleWorkingCapitalChange}
            />
            <EditableTextBox
              title="Capex"
              value={capex}
              onChange={handleCapexChange}
            />
          </div>
        </div>

        {/* Right Column (Smaller) */}
        <div className="space-y-8">
          {/* FCF Estimate Chart */}
          <div>
            <h2 className="text-[#527853] text-lg font-semibold mb-4">FCF ESTIMATE</h2>
            <FCFBarChart data={fcfChartData} />
          </div>

          {/* Pie Charts */}
          <div className="space-y-8">
            <DynamicPieChart 
              data={yearOnePieData}
              title={`CASH SPEND (${calculateTotalSpend(yearOnePieData).toLocaleString()})\n(Y1)`}
            />
            <DynamicPieChart 
              data={fiveYearPieData}
              title={`CASH SPEND (${calculateTotalSpend(fiveYearPieData).toLocaleString()})\n(5Y Total)`}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
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
    </div>
  );
};

export default Slide8;