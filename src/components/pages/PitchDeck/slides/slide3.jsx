import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePitchDeck } from '../context/PitchDeckContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_TIMELINE_DATA = [
  { id: 1, label: '', text: '', placeholder: 'Q3/24' },
  { id: 2, label: '', text: '', placeholder: 'Q4/24' },
  { id: 3, label: '', text: '', placeholder: 'Q1/25' },
  { id: 4, label: '', text: '', placeholder: 'Q2/25' },
  { id: 5, label: '', text: '', placeholder: 'H2/25' },
  { id: 6, label: '', text: '', placeholder: 'H1/26' },
  { id: 7, label: '', text: '', placeholder: 'H2/26' },
];

const Slide3 = () => {
  const { updateSlideData, getSlideData } = usePitchDeck();
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  const [timelineData, setTimelineData] = useState(DEFAULT_TIMELINE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const convertBackendDataToFrontend = (backendData) => {
    if (!backendData || Object.keys(backendData).length === 0) {
      return DEFAULT_TIMELINE_DATA;
    }

    // Create a copy of DEFAULT_TIMELINE_DATA
    const convertedData = DEFAULT_TIMELINE_DATA.map(item => ({...item}));

    // Iterate through the backend data
    Object.entries(backendData).forEach(([key, value]) => {
      // Find the matching placeholder in DEFAULT_TIMELINE_DATA
      const index = DEFAULT_TIMELINE_DATA.findIndex(item => {
        const placeholderDate = item.placeholder.toLowerCase();
        const keyDate = key.toLowerCase();
        return placeholderDate === keyDate || keyDate.includes(placeholderDate.slice(0, -2));
      });

      if (index !== -1) {
        convertedData[index] = {
          ...convertedData[index],
          label: key,
          text: value.content || ''
        };
      }
    });

    return convertedData;
  };

  const loadDataFromBackend = async () => {
    if (!proposalId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide3/${proposalId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slide data');
      }

      const data = await response.json();
      console.log('Backend API Response:', data);
      
      if (data.status && data.data?.slide3?.timelineData) {
        const backendData = data.data.slide3.timelineData;
        console.log('Backend Timeline Data:', backendData);
        const convertedData = convertBackendDataToFrontend(backendData);
        console.log('Converted Timeline Data:', convertedData);
        setTimelineData(convertedData);
        updateSlideData(3, { timelineData: backendData });
      }
    } catch (error) {
      console.error('Error loading slide data:', error);
      setError(error.message);
      toast.error('Failed to load slide data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // First, try to get data from context
      const contextData = getSlideData(3);
      
      if (contextData?.timelineData && Object.keys(contextData.timelineData).length > 0) {
        console.log('Found data in context:', contextData.timelineData);
        const convertedData = convertBackendDataToFrontend(contextData.timelineData);
        console.log('Converted context data:', convertedData);
        setTimelineData(convertedData);
      } else {
        console.log('No context data found, fetching from backend...');
        await loadDataFromBackend();
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, [proposalId]);

  const handleTextChange = (index, value) => {
    setTimelineData(prevData => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        text: value
      };
      return newData;
    });
    setIsDirty(true);
  };

  const handleLabelChange = (index, value) => {
    setTimelineData(prevData => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        label: value
      };
      return newData;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!proposalId) {
      toast.error('No proposal ID found');
      return;
    }

    try {
      setIsLoading(true);

      // Convert timeline data to backend format
      const convertedTimelineData = {};
      timelineData.forEach((item) => {
        if (item.text.trim()) {
          const key = item.label.trim() || item.placeholder;
          convertedTimelineData[key] = {
            content: item.text.trim()
            // Removed originalPosition and originalPlaceholder as they're not needed
          };
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          timelineData: convertedTimelineData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save slide');
      }

      const data = await response.json();

      if (data.status) {
        // Update context with the latest data
        updateSlideData(3, { timelineData: convertedTimelineData });
        setIsDirty(false);
        toast.success('Changes saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save slide');
      }

    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 relative" data-slide="3" data-is-dirty={isDirty.toString()}>
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

      <div className="border-2 border-black-900 rounded-lg p-6 bg-white">
        <div className="relative">
          <div className="bg-[#527853] text-white p-4 -mx-6 -mt-6 rounded-t-lg">
            <h2 className="text-center text-2xl font-normal">
              Next 3 Year Journey
            </h2>
          </div>
          
          <div className="relative flex justify-center items-center mt-12">
            <div className="absolute bg-[#527853] h-2 w-full max-w-4xl rounded-full"></div>
            <div className="flex flex-wrap justify-between w-full max-w-4xl mt-10">
              {timelineData.map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative flex flex-col items-center mb-8"
                  style={{
                    width: 'calc(100% / 4 - 20px)',
                  }}
                >
                  <textarea
                    value={item.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="resize-none border rounded p-3 w-full text-left mb-2 bg-gray-50 focus:bg-gray-100"
                    placeholder="Enter text here"
                    style={{
                      minHeight: '150px',
                    }}
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    placeholder={item.placeholder}
                    className="mt-2 rounded-full bg-gray-200 px-4 py-2 text-sm text-center w-24 focus:outline-none focus:ring-2 focus:ring-[#527853]"
                  />
                </div>
              ))}
            </div>
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

export default Slide3;