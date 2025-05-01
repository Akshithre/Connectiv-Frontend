import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Edit2, Upload, Save, Plus, Minus, X } from 'lucide-react';
import { usePitchDeck } from '../context/PitchDeckContext';
import { pitchDeckApi } from '../../../../services/pitchDeckApi';
import { useLocation } from 'react-router-dom';
import { uploadToS3 } from '../../../../utils/s3Utils';  // Make sure path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const COLORS = ['#319b59', '#22c55e', '#86efac', '#095a28', '#0bd82a'];
const DEFAULT_PIE_DATA = [
  { name: 'Segment 1', value: 300, color: '#166534' },
  { name: 'Segment 2', value: 150, color: '#22c55e' },
  { name: 'Segment 3', value: 50, color: '#86efac' }
];

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Enhanced Value Input component
const ValueInput = ({ currency, value, unit, onCurrencyChange, onValueChange, onUnitChange, currencyOptions, unitOptions }) => (
  <div className="flex items-center gap-3">
    {/* Currency Dropdown - Made Wider */}
    <div className="w-32">
      <select
        value={currency}
        onChange={onCurrencyChange}
        className="w-full px-4 py-3 text-base border rounded-md bg-white focus:outline-none focus:ring-2 
                 focus:ring-[#437549] focus:border-transparent shadow-sm appearance-none
                 bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: '24px',
          backgroundPosition: 'right 8px center'
        }}
      >
        {currencyOptions.map(curr => (
          <option key={curr} value={curr} className="py-2 text-base">
            {curr}
          </option>
        ))}
      </select>
    </div>

    {/* Value Input - Made Larger */}
    <div className="flex-1">
      <input
        type="number"
        value={value}
        onChange={onValueChange}
        placeholder="Value"
        className="w-full px-4 py-3 text-base border rounded-md focus:outline-none focus:ring-2 
                 focus:ring-[#437549] focus:border-transparent shadow-sm"
      />
    </div>

    {/* Unit Dropdown - Made Wider */}
    <div className="w-28">
      <select
        value={unit}
        onChange={onUnitChange}
        className="w-full px-4 py-3 text-base border rounded-md bg-white focus:outline-none focus:ring-2 
                 focus:ring-[#437549] focus:border-transparent shadow-sm appearance-none
                 bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: '24px',
          backgroundPosition: 'right 8px center'
        }}
      >
        {unitOptions.map(u => (
          <option key={u} value={u} className="py-2 text-base">
            {u.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const calculateTotalMarketSize = (data) => {
  return data.reduce((sum, segment) => sum + (Number(segment.value) || 0), 0);
};

const calculateCAGR = (marketData) => {
  const years = marketData.targetYear - marketData.startYear;
  if (years === 0 || marketData.startValue === 0) return 0;
  const cagr = ((Math.pow(marketData.targetValue / marketData.startValue, 1 / years) - 1) * 100);
  return cagr.toFixed(1);
};

// Transform frontend data to backend format
const transformDataForBackend = (data) => {
  return {
    businessInfo: {
      name: data.businessInfo.name || '',
      logo: {
        type: data.businessInfo.logo?.type || '',
        file: data.businessInfo.logo?.file || ''
      }
    },
    productPictures: data.productPictures.map(pic => ({
      type: pic.image?.type || '',
      file: pic.image?.file || ''
    })),
    founders: data.founders.map(founder => ({
      image: {
        type: founder.image?.type || '',
        file: founder.image?.file || ''
      },
      name: founder.name || '',
      background: founder.background || ''
    })),
    strengths: {
      strength1: data.strengths[0]?.content || '',
      strength2: data.strengths[1]?.content || '',
      strength3: data.strengths[2]?.content || ''
    },
    targetedMarketSize: {
      year: data.pieChartData.targetYear,
      segments: data.pieChartData.data.reduce((acc, segment) => {
        acc[segment.name] = segment.value;
        return acc;
      }, {}),
      totalValue: {
        amount: calculateTotalMarketSize(data.pieChartData.data),
        currency: 'USD',
        scale: 'Billion'
      }
    },
    opportunity_data: {
      currentYear: data.marketData.startYear,
      targetYear: data.marketData.targetYear,
      currentValue: {
        amount: data.marketData.startValue,
        currency: data.marketData.startCurrency,
        scale: data.marketData.startUnit.toUpperCase() === 'B' ? 'Billion' : 'Million'
      },
      futureValue: {
        amount: data.marketData.targetValue,
        currency: data.marketData.targetCurrency,
        scale: data.marketData.targetUnit.toUpperCase() === 'B' ? 'Billion' : 'Million'
      },
      cagr: `${calculateCAGR(data.marketData)}%`
    },

    developmentFields: {
      productDev: data.devFields.productDev.split('\n').filter(item => item.trim()),
      targetCustomers: data.devFields.targetCustomers.split('\n').filter(item => item.trim()),
      marketUsp: data.devFields.marketUsp.split('\n').filter(item => item.trim())
    }
  };
};

// Transform backend data to frontend format
// Transform backend data to frontend format
const transformDataFromBackend = (backendData) => {
  return {
    businessInfo: {
      name: backendData?.businessInfo?.name || 'Business Name',
      logo: {
        type: backendData?.businessInfo?.logo?.type || '',
        file: backendData?.businessInfo?.logo?.file || '',
        preview: backendData?.businessInfo?.logo?.file || null
      },
      isEditingName: false
    },
    productPictures: [
      {
        id: 1,
        image: {
          type: backendData?.productPictures?.[0]?.type || '',
          file: backendData?.productPictures?.[0]?.file || '',
          preview: backendData?.productPictures?.[0]?.file || null
        }
      },
      {
        id: 2,
        image: {
          type: backendData?.productPictures?.[1]?.type || '',
          file: backendData?.productPictures?.[1]?.file || '',
          preview: backendData?.productPictures?.[1]?.file || null
        }
      }
    ],
    founders: [
      {
        id: 1,
        image: {
          type: backendData?.founders?.[0]?.image?.type || '',
          file: backendData?.founders?.[0]?.image?.file || '',
          preview: backendData?.founders?.[0]?.image?.file || null
        },
        name: backendData?.founders?.[0]?.name || '',
        background: backendData?.founders?.[0]?.background || ''
      },
      {
        id: 2,
        image: {
          type: backendData?.founders?.[1]?.image?.type || '',
          file: backendData?.founders?.[1]?.image?.file || '',
          preview: backendData?.founders?.[1]?.image?.file || null
        },
        name: backendData?.founders?.[1]?.name || '',
        background: backendData?.founders?.[1]?.background || ''
      }
    ],
    // ... rest of the transformation remains the same
    marketData: {
      startYear: backendData?.opportunity_data?.currentYear || 2023,
      startValue: backendData?.opportunity_data?.currentValue?.amount || 17,
      startUnit: backendData?.opportunity_data?.currentValue?.scale === 'Billion' ? 'b' : 'M',
      startCurrency: backendData?.opportunity_data?.currentValue?.currency || 'USD',
      targetYear: backendData?.opportunity_data?.targetYear || 2028,
      targetValue: backendData?.opportunity_data?.futureValue?.amount || 25,
      targetUnit: backendData?.opportunity_data?.futureValue?.scale === 'Billion' ? 'b' : 'M',
      targetCurrency: backendData?.opportunity_data?.futureValue?.currency || 'USD',
      isEditing: false
    },
    pieChartData: {
      targetYear: backendData?.targetedMarketSize?.year || 2028,
      data: Object.entries(backendData?.targetedMarketSize?.segments || {}).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      })) || DEFAULT_PIE_DATA
    },
    strengths: [
      { title: 'Strength - 1', content: backendData?.strengths?.strength1 || '' },
      { title: 'Strength - 2', content: backendData?.strengths?.strength2 || '' },
      { title: 'Strength - 3', content: backendData?.strengths?.strength3 || '' }
    ],
    devFields: {
      productDev: (backendData?.developmentFields?.productDev || []).join('\n'),
      targetCustomers: (backendData?.developmentFields?.targetCustomers || []).join('\n'),
      marketUsp: (backendData?.developmentFields?.marketUsp || []).join('\n')
    }
  };
};

const Slide2 = () => {
  const location = useLocation();
  const locationProposalId = location.state?.proposalId;
  const { updateSlideData, getSlideData, proposalId: contextProposalId } = usePitchDeck();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [pendingUploads, setPendingUploads] = useState({
    logo: null,
    product1: null,
    product2: null,
    founder1: null,
    founder2: null
  });
  const currentProposalId = location.state?.proposalId;
  // Add this right after your state declarations
  const handleStateChange = () => {
    setIsDirty(true);
  };

  // Refs for file inputs
  const fileInputRefs = {
    logo: useRef(null),
    product1: useRef(null),
    product2: useRef(null),
    founder1: useRef(null),
    founder2: useRef(null)
  };

  // State declarations
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    name: 'Business Name',
    logo: { type: '', file: '', preview: null },
    isEditingName: false
  });

  const [productPictures, setProductPictures] = useState([
    { id: 1, image: { type: '', file: '', preview: null } },
    { id: 2, image: { type: '', file: '', preview: null } }
  ]);

  const [founders, setFounders] = useState([
    { id: 1, image: { type: '', file: '', preview: null }, name: '', background: '' },
    { id: 2, image: { type: '', file: '', preview: null }, name: '', background: '' }
  ]);

  const [marketData, setMarketData] = useState({
    startYear: 2023,
    startValue: 17,
    startUnit: 'b',
    startCurrency: 'USD',
    targetYear: 2028,
    targetValue: 25,
    targetUnit: 'b',
    targetCurrency: 'USD',
    isEditing: false
  });

  const [pieChartData, setPieChartData] = useState({
    targetYear: 2028,
    data: [
      { name: 'Segment 1', value: 300, color: '#166534' },
      { name: 'Segment 2', value: 150, color: '#22c55e' },
      { name: 'Segment 3', value: 50, color: '#86efac' }
    ]
  });

  const [strengths, setStrengths] = useState([
    { title: 'Strength - 1', content: '' },
    { title: 'Strength - 2', content: '' },
    { title: 'Strength - 3', content: '' }
  ]);

  const [devFields, setDevFields] = useState({
    productDev: '',
    targetCustomers: '',
    marketUsp: ''
  });

  const fetchSlide2Data = async () => {
    try {
      console.log('Starting Slide 2 data fetch...');

      if (!currentProposalId) {
        console.log('No proposal ID available');
        setIsLoading(false);
        return;
      }

      console.log('Fetching with proposalId:', currentProposalId);

      // First, check if data exists in context
      const contextData = getSlideData(2);
      console.log('Context data:', contextData);

      if (Object.keys(contextData).length > 0) {
        console.log('Using data from context');
        const transformedData = transformDataFromBackend(contextData);
        updateStatesFromTransformedData(transformedData);
        setIsLoading(false);
        return;
      }

      // If no context data, fetch from backend
      console.log('No context data, fetching from backend...');
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide2/${currentProposalId}`);
      const data = await response.json();
      console.log('Slide 2 API Response:', data);

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 2 data');
      }

      const slideData = data.data;

      if (!slideData?.slide2) {
        console.log('No slide2 data found in proposal');
        setIsLoading(false);
        return;
      }

      const transformedData = transformDataFromBackend(slideData.slide2);
      console.log('Transformed Data:', transformedData);

      // Update context
      // updateSlideData(2, slideData.slide2);

      // Update component state
      updateStatesFromTransformedData(transformedData);

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch Slide 2 data');
      }

    } catch (error) {
      console.error('Error in fetchSlide2Data:', error);
      setError(error.message);
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



  // Helper function to update all states from transformed data
  const updateStatesFromTransformedData = (transformedData) => {
    setBusinessInfo(transformedData.businessInfo);
    setProductPictures(transformedData.productPictures);
    setFounders(transformedData.founders);
    setMarketData(transformedData.marketData);
    setPieChartData(transformedData.pieChartData);
    setStrengths(transformedData.strengths);
    setDevFields(transformedData.devFields);
    setIsDirty(false);
  };

  // Constants
  const currencyOptions = ['USD', 'EUR', 'INR'];
  const unitOptions = ['b', 'M'];

  // Helper functions
  const calculateCAGR = () => {
    const years = marketData.targetYear - marketData.startYear;
    if (years === 0 || marketData.startValue === 0) return 0;
    return ((Math.pow(marketData.targetValue / marketData.startValue, 1 / years) - 1) * 100).toFixed(1);
  };

  const calculateTotalMarketSize = () => {
    return pieChartData.data.reduce((sum, segment) => sum + segment.value, 0);
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-2 border rounded-lg shadow-lg">
          <p className="font-medium text-[#437549]">
            {`${data.currency} ${data.value} ${data.unit === 'b' ? 'Billion' : 'Million'}`}
          </p>
          <p className="text-sm text-gray-500">{data.year}</p>
        </div>
      );
    }
    return null;
  };

  const handleSave = async () => {
    if (!currentProposalId) {
      console.error('No proposal ID available');
      toast.error('No proposal ID found');
      return;
    }
  
    try {
      setIsLoading(true);
      let updatedBusinessInfo = { ...businessInfo };
      let updatedProductPictures = [...productPictures];
      let updatedFounders = [...founders];
  
      // Handle all pending uploads first
      if (Object.values(pendingUploads).some(upload => upload !== null)) {
        const uploadPromises = [];
  
        // Handle logo upload
        if (pendingUploads.logo) {
          uploadPromises.push(
            uploadToS3(pendingUploads.logo).then(result => {
              if (result.success) {
                updatedBusinessInfo.logo = {
                  ...updatedBusinessInfo.logo,
                  file: result.url
                };
              }
            })
          );
        }
  
        // Handle product images
        for (let i = 1; i <= 2; i++) {
          if (pendingUploads[`product${i}`]) {
            uploadPromises.push(
              uploadToS3(pendingUploads[`product${i}`]).then(result => {
                if (result.success) {
                  updatedProductPictures = updatedProductPictures.map(pic =>
                    pic.id === i ? {
                      ...pic,
                      image: { ...pic.image, file: result.url }
                    } : pic
                  );
                }
              })
            );
          }
        }
  
        // Handle founder images
        for (let i = 1; i <= 2; i++) {
          if (pendingUploads[`founder${i}`]) {
            uploadPromises.push(
              uploadToS3(pendingUploads[`founder${i}`]).then(result => {
                if (result.success) {
                  updatedFounders = updatedFounders.map(f =>
                    f.id === i ? {
                      ...f,
                      image: { ...f.image, file: result.url }
                    } : f
                  );
                }
              })
            );
          }
        }
  
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }
  
      // Prepare data with updated images
      const currentData = {
        businessInfo: updatedBusinessInfo,
        productPictures: updatedProductPictures,
        founders: updatedFounders,
        marketData,
        pieChartData,
        strengths,
        devFields
      };
  
      // Transform and send to backend
      const transformedData = transformDataForBackend(currentData);
  
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: currentProposalId,
          Slide2: transformedData
        })
      });
  
      const result = await response.json();
      if (!result.status) {
        throw new Error(result.message || 'Failed to save slide');
      }
  
      // Update all states with the new data
      setBusinessInfo(updatedBusinessInfo);
      setProductPictures(updatedProductPictures);
      setFounders(updatedFounders);
      
      // Clear pending uploads
      setPendingUploads({
        logo: null,
        product1: null,
        product2: null,
        founder1: null,
        founder2: null
      });
  
      setLastSavedState(currentData);
      updateSlideData(2, transformedData);
      setIsDirty(false);
  
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
      console.error('Failed to save slide 2:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (event, type, id = null) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setIsLoading(true);
      const previewUrl = URL.createObjectURL(file);
  
      // Store file for later upload and update UI with preview
      if (type === 'logo') {
        setPendingUploads(prev => ({ ...prev, logo: file }));
        setBusinessInfo(prev => ({
          ...prev,
          logo: {
            type: file.type,
            file: '',
            preview: previewUrl
          }
        }));
        setIsDirty(true); // Explicitly set isDirty to true
      } else if (type === 'product') {
        setPendingUploads(prev => ({ ...prev, [`product${id}`]: file }));
        setProductPictures(prev =>
          prev.map(pic => pic.id === id ? {
            ...pic,
            image: {
              type: file.type,
              file: '',
              preview: previewUrl
            }
          } : pic)
        );
        setIsDirty(true); // Explicitly set isDirty to true
      } else if (type === 'founder') {
        setPendingUploads(prev => ({ ...prev, [`founder${id}`]: file }));
        setFounders(prev =>
          prev.map(f => f.id === id ? {
            ...f,
            image: {
              type: file.type,
              file: '',
              preview: previewUrl
            }
          } : f)
        );
      }
  
      setIsDirty(true);
  
    } catch (error) {
      console.error('File handling error:', error);
      toast.error('Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };
  

  const addPieSegment = () => {
    if (pieChartData.data.length < 5) {
      setPieChartData(prev => ({
        ...prev,
        data: [
          ...prev.data,
          {
            name: `Segment ${prev.data.length + 1}`,
            value: 0,
            color: COLORS[prev.data.length % COLORS.length]
          }
        ]
      }));
    }
  };

  const removePieSegment = (index) => {
    setPieChartData(prev => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index)
    }));
  };

  // Bar chart data
  const barChartData = [
    {
      year: marketData.startYear,
      value: marketData.startValue,
      unit: marketData.startUnit,
      currency: marketData.startCurrency
    },
    {
      year: marketData.targetYear,
      value: marketData.targetValue,
      unit: marketData.targetUnit,
      currency: marketData.targetCurrency
    }
  ];



  useEffect(() => {
    const loadData = async () => {
      if (!currentProposalId) {
        console.log('No proposalId available');
        return;
      }

      setIsLoading(true);
      try {
        // First check context for existing data
        const contextData = getSlideData(2);
        console.log('Checking context data:', contextData);

        if (Object.keys(contextData).length > 0) {
          console.log('Found data in context, using it...');
          const transformedData = transformDataFromBackend(contextData);
          updateStatesFromTransformedData(transformedData);
          setLastSavedState(transformedData); // Store initial state
          setIsLoading(false);
          return;
        }

        // If no context data, fetch from backend
        console.log('No context data found, fetching from backend...');
        await fetchSlide2Data();
      } catch (error) {
        console.error('LoadData error:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentProposalId]);

  useEffect(() => {
    if (lastSavedState) {
      const hasChanges = JSON.stringify({
        businessInfo,
        productPictures,
        founders,
        marketData,
        pieChartData,
        strengths,
        devFields
      }) !== JSON.stringify(lastSavedState);
      
      setIsDirty(hasChanges);
    }
  }, [businessInfo, productPictures, founders, marketData, pieChartData, strengths, devFields]);

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (businessInfo.logo?.preview) URL.revokeObjectURL(businessInfo.logo.preview);
      productPictures.forEach(pic => {
        if (pic.image?.preview) URL.revokeObjectURL(pic.image.preview);
      });
      founders.forEach(founder => {
        if (founder.image?.preview) URL.revokeObjectURL(founder.image.preview);
      });
    };
  }, []);


  return (
    <div className="relative flex flex-col h-screen"
      data-slide="2"
      data-is-dirty={isDirty.toString()}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
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
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto p-5 min-h-full pb-24">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden hover:bg-gray-200 transition-colors"
              onClick={() => fileInputRefs.logo.current.click()}
            >
              {businessInfo.logo?.preview || businessInfo.logo?.file ? (
                <img
                  src={businessInfo.logo.preview || businessInfo.logo.file}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-xs text-gray-400">
                  <Upload className="w-4 h-4 mb-1" />
                  LOGO
                </div>
              )}
              <input
                ref={fileInputRefs.logo}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'logo')}
              />
            </div>
            <div className="relative">
              {businessInfo.isEditingName ? (
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={(e) => {
                    setBusinessInfo(prev => ({ ...prev, name: e.target.value }));
                    setIsDirty(true);  // Changed from handleStateChange() to this
                  }}
                  onBlur={() => setBusinessInfo(prev => ({ ...prev, isEditingName: false }))}
                  className="text-xl font-medium text-[#437549] border-b-2 border-[#437549] focus:outline-none bg-transparent px-1"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-medium text-[#437549]">{businessInfo.name}</h1>
                  <Edit2
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setBusinessInfo(prev => ({ ...prev, isEditingName: true }))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-3">
              {/* Product Pictures */}
              <div className="mb-8">
                <h2 className="text-sm font-medium mb-4 text-gray-700">Product Pictures</h2>
                <div className="grid grid-cols-2 gap-3">
                  {productPictures.map((picture) => (
                    <div
                      key={picture.id}
                      className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden hover:bg-gray-200 transition-colors"
                      onClick={() => fileInputRefs[`product${picture.id}`].current.click()}
                    >
                      {picture.image?.preview || picture.image?.file ? (
                        <img
                          src={picture.image.preview || picture.image.file}
                          alt={`Product ${picture.id}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-xs text-gray-400">
                          <Upload className="w-4 h-4 mb-1" />
                          Picture
                        </div>
                      )}
                      <input
                        ref={fileInputRefs[`product${picture.id}`]}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'product', picture.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Founders */}
              <div>
                <h2 className="text-sm font-medium mb-4 text-gray-700">Key Founders</h2>
                <div className="grid grid-cols-2 gap-4">
                  {founders.map((founder) => (
                    <div key={founder.id} className="space-y-3">
                      <div
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden hover:bg-gray-200 transition-colors"
                        onClick={() => fileInputRefs[`founder${founder.id}`].current.click()}
                      >
                        {founder.image?.preview || founder.image?.file ? (
                          <img
                            src={founder.image.preview || founder.image.file}
                            alt={`Founder ${founder.id}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-xs text-gray-400">
                            <Upload className="w-4 h-4 mb-1" />
                            Photo
                          </div>
                        )}
                        <input
                          ref={fileInputRefs[`founder${founder.id}`]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'founder', founder.id)}
                        />
                      </div>
                      <input
                        placeholder="Name"
                        value={founder.name}
                        onChange={(e) => setFounders(prev =>
                          prev.map(f => f.id === founder.id ? { ...f, name: e.target.value } : f)
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#437549] focus:border-transparent"
                      />
                      <textarea
                        placeholder="Background"
                        value={founder.background}
                        onChange={(e) => setFounders(prev =>
                          prev.map(f => f.id === founder.id ? { ...f, background: e.target.value } : f)
                        )}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#437549] focus:border-transparent min-h-[100px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-9 space-y-6">
              {/* Strengths Section */}
              {/* Strengths Section */}
              <div className="bg-[#437549] p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-3 gap-6">
                  {strengths.map((strength, i) => (
                    <div key={i} className="text-white">
                      <h3 className="text-sm font-medium mb-3">{strength.title}</h3>
                      <textarea
                        placeholder="Enter strengths (one per line, e.g. 1. ABC)"
                        value={strength.content}
                        onChange={(e) => {
                          setStrengths(prev => prev.map((s, index) =>
                            index === i ? { ...s, content: e.target.value } : s
                          ));
                          setIsDirty(true);  // Changed from handleStateChange() to this
                        }}
                        className="w-full px-4 py-3 bg-[#548960] rounded-lg text-white placeholder-green-200 
             text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#6a9f76] 
             min-h-[120px] resize-y shadow-inner"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Opportunity Size */}
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-[#437549]">OPPORTUNITY SIZE</h3>
                    <Edit2
                      className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() => setMarketData(prev => ({ ...prev, isEditing: !prev.isEditing }))}
                    />
                  </div>

                  {marketData.isEditing ? (
                    <div className="space-y-8">
                      {/* Years Section */}
                      <div className="grid grid-cols-2 gap-8">
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Start Year</label>
    <input
      type="number"
      value={marketData.startYear}
      onChange={(e) => {
        const value = e.target.value ? parseInt(e.target.value, 10) : '';
        setMarketData(prev => ({
          ...prev,
          startYear: value
        }));
        setIsDirty(true);
      }}
      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                focus:ring-[#437549] focus:border-transparent shadow-sm [appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      placeholder="Enter start year"
      min="1900"
      max="2100"
    />
  </div>
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Target Year</label>
    <input
      type="number"
      value={marketData.targetYear}
      onChange={(e) => {
        const value = e.target.value ? parseInt(e.target.value, 10) : '';
        setMarketData(prev => ({
          ...prev,
          targetYear: value
        }));
        setIsDirty(true);
      }}
      className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                focus:ring-[#437549] focus:border-transparent shadow-sm [appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      placeholder="Enter target year"
      min="1900"
      max="2100"
    />
  </div>
</div>

                      {/* Market Size Section */}
                      <div className="grid grid-cols-2 gap-8">
                        {/* Start Market Size */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Start Market Size</label>
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-2">
                              <select
                                value={marketData.startCurrency}
                                onChange={(e) => setMarketData(prev => ({ ...prev, startCurrency: e.target.value }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                           focus:ring-[#437549] focus:border-transparent shadow-sm bg-white"
                              >
                                {currencyOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={marketData.startValue}
                                onChange={(e) => setMarketData(prev => ({
                                  ...prev,
                                  startValue: parseFloat(e.target.value)
                                }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
             focus:ring-[#437549] focus:border-transparent shadow-sm [appearance:textfield]
             [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Enter value"
                              />
                              <select
                                value={marketData.startUnit}
                                onChange={(e) => setMarketData(prev => ({ ...prev, startUnit: e.target.value }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                           focus:ring-[#437549] focus:border-transparent shadow-sm bg-white"
                              >
                                <option value="m">Million</option>
                                <option value="b">Billion</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500">Enter the market size for the start year</p>
                          </div>
                        </div>

                        {/* Target Market Size */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Target Market Size</label>
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-2">
                              <select
                                value={marketData.targetCurrency}
                                onChange={(e) => setMarketData(prev => ({ ...prev, targetCurrency: e.target.value }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                           focus:ring-[#437549] focus:border-transparent shadow-sm bg-white"
                              >
                                {currencyOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={marketData.targetValue}
                                onChange={(e) => setMarketData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
               focus:ring-[#437549] focus:border-transparent shadow-sm [appearance:textfield] 
               [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Enter value"
                              />
                              <select
                                value={marketData.targetUnit}
                                onChange={(e) => setMarketData(prev => ({ ...prev, targetUnit: e.target.value }))}
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 
                           focus:ring-[#437549] focus:border-transparent shadow-sm bg-white"
                              >
                                <option value="m">Million</option>
                                <option value="b">Billion</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500">Enter the projected market size for the target year</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-8">
                      <div className="text-lg font-medium text-gray-800">
                        {marketData.startCurrency} {marketData.startValue} {marketData.startUnit === 'b' ? 'Billion' : 'Million'}
                      </div>
                      <div className="text-lg font-medium text-[#437549]">
                        CAGR: {calculateCAGR()}%
                      </div>
                      <div className="text-lg font-medium text-gray-800">
                        {marketData.targetCurrency} {marketData.targetValue} {marketData.targetUnit === 'b' ? 'Billion' : 'Million'}
                      </div>
                    </div>
                  )}

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="year"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="left"
                          tickFormatter={(value) =>
                            `${marketData.startCurrency} ${value} ${marketData.startUnit === 'b' ? 'Billion' : 'Million'}`
                          }
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 'auto']}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white px-4 py-2 border rounded-lg shadow-lg">
                                  <p className="font-medium text-[#437549]">
                                    {`${payload[0].payload.currency} ${payload[0].payload.value} ${payload[0].payload.unit === 'b' ? 'Billion' : 'Million'
                                      }`}
                                  </p>
                                  {payload[1] && (
                                    <p className="font-medium text-orange-500">
                                      {`CAGR: ${payload[1].value}%`}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">{payload[0].payload.year}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ fill: 'rgba(67, 117, 73, 0.1)' }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="value"
                          fill="#437549"
                          radius={[4, 4, 0, 0]}
                          barSize={60}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          data={[
                            { year: marketData.startYear, cagr: 0 },
                            { year: marketData.targetYear, cagr: Number(calculateCAGR()) }
                          ]}
                          dataKey="cagr"
                          stroke="#ff8c00"
                          strokeWidth={2}
                          dot={{ fill: '#ff8c00', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Targeted Market Size */}
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[#437549]">
                      TARGETED MARKET SIZE
                      <span className="ml-2 text-gray-600">
                        (Total: {marketData.targetCurrency} {calculateTotalMarketSize()} {marketData.targetUnit === 'b' ? 'Billion' : 'Million'})
                      </span>
                    </h3>
                    <Edit2
                      className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() => setIsModalOpen(true)}
                    />
                  </div>

                  <div className="text-sm text-gray-600 mb-4">Year: {pieChartData.targetYear}</div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData.data}
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          dataKey="value"
                          labelLine={false}
                          label={false}
                        >
                          {pieChartData.data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          formatter={(value, entry) => (
                            <span className="text-sm text-gray-600">
                              {`${value}: ${entry.payload.value}`}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Development Fields */}
              <div className="bg-[#437549] rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-6">
                  {/* Product Development */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">Product dev / Service dely</h3>
                    <textarea
                      value={devFields.productDev}
                      onChange={(e) => setDevFields(prev => ({
                        ...prev,
                        productDev: e.target.value
                      }))}
                      placeholder="Enter products/services (one per line, e.g. 1. ABC)"
                      className="w-full px-4 py-3 bg-[#548960] rounded-lg text-white placeholder-green-200 
                               text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#6a9f76] 
                               min-h-[150px] resize-y shadow-inner"
                    />
                  </div>

                  {/* Target Customers */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">Target Customers / acq.</h3>
                    <textarea
                      value={devFields.targetCustomers}
                      onChange={(e) => setDevFields(prev => ({
                        ...prev,
                        targetCustomers: e.target.value
                      }))}
                      placeholder="Enter target customers (one per line, e.g. 1. ABC)"
                      className="w-full px-4 py-3 bg-[#548960] rounded-lg text-white placeholder-green-200 
                               text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#6a9f76] 
                               min-h-[150px] resize-y shadow-inner"
                    />
                  </div>

                  {/* Market USP */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">MARKET USP</h3>
                    <textarea
                      value={devFields.marketUsp}
                      onChange={(e) => setDevFields(prev => ({
                        ...prev,
                        marketUsp: e.target.value
                      }))}
                      placeholder="Enter market USPs (one per line, e.g. 1. ABC)"
                      className="w-full px-4 py-3 bg-[#548960] rounded-lg text-white placeholder-green-200 
                               text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#6a9f76] 
                               min-h-[150px] resize-y shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Market Segments"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Target Year:</span>
            <input
              type="number"
              value={pieChartData.targetYear}
              onChange={(e) => setPieChartData(prev => ({
                ...prev,
                targetYear: parseInt(e.target.value)
              }))}
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 
             focus:ring-[#437549] focus:border-transparent w-24 [appearance:textfield]
             [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {pieChartData.data.length < 5 && (
              <button
                onClick={addPieSegment}
                className="ml-auto px-4 py-2 text-sm bg-[#437549] text-white rounded-md hover:bg-[#548960] 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-[#437549] focus:ring-offset-2"
              >
                Add Segment
              </button>
            )}
          </div>

          {pieChartData.data.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={segment.name}
                onChange={(e) => {
                  const newData = [...pieChartData.data];
                  newData[index] = { ...segment, name: e.target.value , color: COLORS[index % COLORS.length]};
                  setPieChartData(prev => ({ ...prev, data: newData }));
                }}
                placeholder="Segment Name"
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#437549] focus:border-transparent"
              />
              <input
                type="number"
                value={segment.value}
                onChange={(e) => {
                  const newData = [...pieChartData.data];
                  newData[index] = { ...segment, value: parseFloat(e.target.value), color: COLORS[index % COLORS.length] };
                  setPieChartData(prev => ({ ...prev, data: newData }));
                }}
                placeholder="Value"
                className="w-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 
             focus:ring-[#437549] focus:border-transparent [appearance:textfield]
             [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {pieChartData.data.length > 1 && (
                <button
                  onClick={() => removePieSegment(index)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 
                           transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>

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

export default Slide2;