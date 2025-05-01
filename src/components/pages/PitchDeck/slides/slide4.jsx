import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePitchDeck } from '../context/PitchDeckContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Modal = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {children}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#527853] text-white rounded-md hover:bg-[#3f5c40]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const Slide4 = () => {
  // All state definitions and other code remains exactly the same until the changes ...
  const { updateSlideData } = usePitchDeck();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  // Initial data
  const initialData = {
    volume: [
      { year: 'Y1', value: 5 },
      { year: 'Y2', value: 31 },
      { year: 'Y3', value: 135 },
      { year: 'Y4', value: 256 },
      { year: 'Y5', value: 423 }
    ],
    revenue: [
      { year: 'Y1', value: 1 },
      { year: 'Y2', value: 12 },
      { year: 'Y3', value: 54 },
      { year: 'Y4', value: 102 },
      { year: 'Y5', value: 171 }
    ],
    ebitda: [
      { year: 'Y1', gp: 2, percentage: 0 },
      { year: 'Y2', gp: 1, percentage: 22 },
      { year: 'Y3', gp: 7, percentage: 25 },
      { year: 'Y4', gp: 16, percentage: 29 },
      { year: 'Y5', gp: 34, percentage: 34 }
    ]
  };

  // State initialization
  const [volumeData, setVolumeData] = useState(initialData.volume);
  const [revenueData, setRevenueData] = useState(initialData.revenue);
  const [ebitdaData, setEbitdaData] = useState(initialData.ebitda);
  const [descriptions, setDescriptions] = useState({
    volume: '',
    revenue: '',
    ebitda: ''
  });
  
  const [activeModal, setActiveModal] = useState(null);
  const [tempData, setTempData] = useState({
    volume: [...initialData.volume],
    revenue: [...initialData.revenue],
    ebitda: [...initialData.ebitda]
  });

  // Load initial data
  useEffect(() => {
    const loadSlideData = async () => {
      if (!proposalId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide4/${proposalId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.status && data.data.slide4) {
          const slideData = data.data.slide4;
          
          // Convert backend data format to frontend format
          const convertVolumeData = Object.entries(slideData.volume?.dataPoints || {}).map(([year, value]) => ({
            year,
            value: parseFloat(value)
          }));
          
          const convertRevenueData = Object.entries(slideData.revenue?.dataPoints || {}).map(([year, value]) => ({
            year,
            value: parseFloat(value)
          }));
          
          const convertEbitdaData = Object.entries(slideData.ebitda?.dataPoints || {}).map(([year, data]) => ({
            year,
            gp: parseFloat(data.value),
            percentage: parseFloat(data.margin)
          }));

          setVolumeData(convertVolumeData.length > 0 ? convertVolumeData : initialData.volume);
          setRevenueData(convertRevenueData.length > 0 ? convertRevenueData : initialData.revenue);
          setEbitdaData(convertEbitdaData.length > 0 ? convertEbitdaData : initialData.ebitda);
          
          setDescriptions({
            volume: slideData.volumeDesc || '',
            revenue: slideData.revenueDesc || '',
            ebitda: slideData.ebitdaDesc || ''
          });
        }
      } catch (error) {
        console.error('Error loading slide data:', error);
        setError('Failed to load slide data');
        toast.dismiss();
        toast.error('Failed to load slide data', {
          toastId: 'load-error',
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadSlideData();
  }, [proposalId]);

  // All other functions and handlers remain exactly the same...
  const handleTempDataChange = (dataSet, index, field, value) => {
    const numericValue = value === '' ? '' : parseFloat(value);
    if (value === '' || !isNaN(numericValue)) {
      setTempData(prev => ({
        ...prev,
        [dataSet]: prev[dataSet].map((item, i) => 
          i === index ? { 
            ...item, 
            [field]: field === 'year' ? value : numericValue
          } : item
        )
      }));
      setIsDirty(true);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleModalSave = (type) => {
    switch(type) {
      case 'volume':
        setVolumeData([...tempData.volume]);
        break;
      case 'revenue':
        setRevenueData([...tempData.revenue]);
        break;
      case 'ebitda':
        setEbitdaData([...tempData.ebitda]);
        break;
    }
    setIsDirty(true);
    setActiveModal(null);
  };

  const handleModalOpen = (type) => {
    setTempData(prev => ({
      ...prev,
      volume: [...volumeData],
      revenue: [...revenueData],
      ebitda: [...ebitdaData]
    }));
    setActiveModal(type);
  };

  const handleDescriptionChange = (key, value) => {
    setDescriptions(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!proposalId) {
      setError('No proposal ID found');
      toast.dismiss();
      toast.error('No proposal ID found', {
        toastId: 'no-proposal-error',
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const volumeDataPoints = volumeData.reduce((acc, item) => {
        acc[item.year] = item.value.toString();
        return acc;
      }, {});

      const revenueDataPoints = revenueData.reduce((acc, item) => {
        acc[item.year] = item.value.toString();
        return acc;
      }, {});

      const ebitdaDataPoints = ebitdaData.reduce((acc, item) => {
        acc[item.year] = {
          value: item.gp.toString(),
          margin: item.percentage.toString()
        };
        return acc;
      }, {});

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          volume: { dataPoints: volumeDataPoints },
          volumeDesc: descriptions.volume,
          revenue: { dataPoints: revenueDataPoints },
          revenueDesc: descriptions.revenue,
          ebitda: { dataPoints: ebitdaDataPoints },
          ebitdaDesc: descriptions.ebitda
        })
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      setIsDirty(false);
      updateSlideData(4, {
        volumeData,
        revenueData,
        ebitdaData,
        descriptions
      });

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
      console.error('Error saving slide:', error);
      setError(error.message || 'Failed to save slide');
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

  const renderChartSection = (type, data, title) => {
    return (
      <div className="flex flex-col">
        <div className="relative">
          <h3 className="text-center font-bold text-[#527853] mb-4">{title}</h3>
          <button 
            onClick={() => handleModalOpen(type)}
            className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full"
          >
            <Edit className="w-5 h-5 text-[#527853]" />
          </button>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'ebitda' ? (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'GP', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  label={{ value: 'Percentage', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Bar yAxisId="left" dataKey="gp" fill="#527853" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', r: 4 }}
                />
              </ComposedChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#527853" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <textarea
          value={descriptions[type]}
          onChange={(e) => handleDescriptionChange(type, e.target.value)}
          className="mt-4 p-3 border rounded resize-none h-40 text-base"
          placeholder="Enter description..."
        />

        <Modal 
          isOpen={activeModal === type}
          onClose={() => setActiveModal(null)}
          onSave={() => handleModalSave(type)}
          title={`Edit ${title} Data`}
        >
          {tempData[type].map((item, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Year</label>
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => handleTempDataChange(type, index, 'year', e.target.value)}
                  className="w-24 border rounded px-3 py-2"
                />
              </div>
              {type === 'ebitda' ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600">GP</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.gp}
                      onChange={(e) => handleTempDataChange(type, index, 'gp', e.target.value)}
                      className="w-32 border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600">Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.percentage}
                      onChange={(e) => handleTempDataChange(type, index, 'percentage', e.target.value)}
                      className="w-32 border rounded px-3 py-2"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.value}
                    onChange={(e) => handleTempDataChange(type, index, 'value', e.target.value)}
                    className="w-32 border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>
          ))}
        </Modal>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-100 relative" data-slide="4" data-is-dirty={isDirty.toString()}>
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

      <div className="border-2 border-black-900 rounded-lg p-6 bg-white">
        <div className="relative">
          <div className="bg-[#527853] text-white p-4 -mx-6 -mt-6 rounded-t-lg">
            <h2 className="text-center text-2xl font-normal">
              Historical Performance
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-8">
            {renderChartSection('volume', volumeData, 'VOLUME')}
            {renderChartSection('revenue', revenueData, 'REVENUE')}
            {renderChartSection('ebitda', ebitdaData, 'EBITDA')}
          </div>
        </div>
      </div>

      {/* Global Save Button */}
      {isDirty && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 
              flex items-center gap-2 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Slide4;
                  