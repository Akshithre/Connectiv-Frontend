import React, { useState, useRef, useEffect } from 'react';
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { uploadToS3 } from '../../../../utils/s3Utils';
import 'react-toastify/dist/ReactToastify.css';

const DEFAULT_VALUES = {
  image: { type: '', file: '', preview: null },
  name_final: '',
  description_final: '',
  ph_no: '',
  mail: ''
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Slide14 = () => {
  const { updateSlideData, getSlideData } = usePitchDeck();
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  const globeInputRef = useRef(null);
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingUploads, setPendingUploads] = useState({ image: null });

  // Initialize with default values on mount
  useEffect(() => {
    const slideData = getSlideData(14);
    if (!slideData?.image) {
      updateSlideData(14, DEFAULT_VALUES);
    } else {
      setInputs(slideData);
    }
  }, []);

  // Fetch data from backend if needed
  useEffect(() => {
    const loadSlideData = async () => {
      if (!proposalId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide14`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.status) {
          const slideData = data.data.find(item => item.proposalId === proposalId);
          if (slideData?.slide14) {
            const newInputs = {
              image: slideData.slide14.image || { type: '', file: '', preview: null },
              name_final: slideData.slide14.name_final || '',
              description_final: slideData.slide14.description_final || '',
              ph_no: slideData.slide14.ph_no || '',
              mail: slideData.slide14.mail || ''
            };
            setInputs(newInputs);
            updateSlideData(14, newInputs);
          }
        }
      } catch (error) {
        console.error('Error loading slide data:', error);
        setError('Failed to load slide data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSlideData();
  }, [proposalId]);

  const handleGlobeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingUploads(prev => ({
        ...prev,
        image: file
      }));
      
      const newInputs = {
        ...inputs,
        image: {
          type: file.type,
          file: '',
          preview: previewUrl
        }
      };
      
      setInputs(newInputs);
      setIsDirty(true);
    }
  };

  const handleInputChange = (field, value) => {
    const newInputs = {
      ...inputs,
      [field]: value
    };
    setInputs(newInputs);
    updateSlideData(14, newInputs);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!proposalId) {
      setError('No proposal ID found');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updatedInputs = { ...inputs };
      if (pendingUploads.image) {
        const uploadResult = await uploadToS3(pendingUploads.image);
        if (!uploadResult.success) {
          throw new Error('Failed to upload image');
        }
        updatedInputs.image.file = uploadResult.url;
      }

      const slideData = {
        proposalId,
        name_final: updatedInputs.name_final,
        description_final: updatedInputs.description_final,
        ph_no: updatedInputs.ph_no,
        mail: updatedInputs.mail,
        image: {
          type: updatedInputs.image.type,
          file: updatedInputs.image.file
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide14`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slideData)
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      setPendingUploads({ image: null });
      setInputs(updatedInputs);
      setIsDirty(false);
      updateSlideData(14, updatedInputs);

      toast.success('Changes saved successfully!', {
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
      toast.error('Failed to save changes', {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      console.error('Failed to save slide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (inputs.image.preview) URL.revokeObjectURL(inputs.image.preview);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#faf7f5] flex relative">
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

      {/* Left side with image upload */}
      <div className="w-1/2 relative">
        <input
          type="file"
          ref={globeInputRef}
          onChange={handleGlobeChange}
          className="hidden"
          accept="image/*"
        />
        <div 
          className={`w-full h-full relative cursor-pointer ${
            !inputs.image.file && !inputs.image.preview ? 'border-2 border-dashed border-gray-300 rounded-r-full flex items-center justify-center' : ''
          }`}
          onClick={() => globeInputRef.current.click()}
        >
          {(inputs.image.file || inputs.image.preview) ? (
            <div className="w-full h-full rounded-r-full overflow-hidden">
              <img 
                src={inputs.image.preview || inputs.image.file} 
                alt="Uploaded image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 rounded-r-full flex items-center justify-center">
                <span className="text-white opacity-0 hover:opacity-100">
                  Click to change image
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">+</div>
              Click to upload image
            </div>
          )}
        </div>
      </div>

      {/* Right side with contact information */}
      <div className="w-1/2 p-12 flex flex-col">
        <div className="space-y-8 mt-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#003366]">
              <svg 
                className="w-6 h-6 text-[#003366]" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={inputs.name_final}
              onChange={(e) => handleInputChange('name_final', e.target.value)}
              placeholder="Name"
              className="text-xl text-[#333] bg-transparent border-none focus:outline-none flex-1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#003366]">
              <svg 
                className="w-6 h-6 text-[#003366]" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={inputs.description_final}
              onChange={(e) => handleInputChange('description_final', e.target.value)}
              placeholder="Designation"
              className="text-xl text-[#333] bg-transparent border-none focus:outline-none flex-1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#003366]">
              <svg 
                className="w-6 h-6 text-[#003366]" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={inputs.ph_no}
              onChange={(e) => handleInputChange('ph_no', e.target.value)}
              placeholder="Phone Number"
              className="text-xl text-[#333] bg-transparent border-none focus:outline-none flex-1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#003366]">
              <svg 
                className="w-6 h-6 text-[#003366]" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={inputs.mail}
              onChange={(e) => handleInputChange('mail', e.target.value)}
              placeholder="Email Address"
              className="text-xl text-[#333] bg-transparent border-none focus:outline-none flex-1"
            />
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

export default Slide14;