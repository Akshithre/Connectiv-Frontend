import React, { useState, useRef, useEffect } from 'react';
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { uploadToS3 } from '../../../../utils/s3Utils';
import 'react-toastify/dist/ReactToastify.css';

const DEFAULT_VALUES = {
  image: { type: '', file: '', preview: null },
  logo: { type: '', file: '', preview: null },
  claim: 'Your company claim here',
  month_year: 'August 2024'
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Slide0 = () => {
  const { updateSlideData, getSlideData } = usePitchDeck();
  const globeInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  const [pendingUploads, setPendingUploads] = useState({ image: null, logo: null });

  // Load data from context or API
  useEffect(() => {
    const loadData = async () => {
      // First try to get data from context
      const savedData = getSlideData(0);
      if (savedData && Object.keys(savedData).length > 0) {
        const normalizedData = {
          image: {
            type: savedData.image?.type || '',
            file: savedData.image?.file || '',
            preview: savedData.image?.preview || null
          },
          logo: {
            type: savedData.logo?.type || '',
            file: savedData.logo?.file || '',
            preview: savedData.logo?.preview || null
          },
          claim: savedData.claim || DEFAULT_VALUES.claim,
          month_year: savedData.month_year || DEFAULT_VALUES.month_year
        };
        setInputs(normalizedData);
        return;
      }

      // If no context data and we have proposalId, fetch from API
      if (proposalId) {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide0/${proposalId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          if (data.status) {
            // Backend returns data directly for the requested proposalId
            const slideData = data.data.slide0;
            if (slideData) {
              const normalizedData = {
                image: {
                  type: slideData.image?.type || '',
                  file: slideData.image?.file || '',
                  preview: slideData.image?.file || null // Use file URL as preview if exists
                },
                logo: {
                  type: slideData.logo?.type || '',
                  file: slideData.logo?.file || '',
                  preview: slideData.logo?.file || null // Use file URL as preview if exists
                },
                claim: slideData.claim || DEFAULT_VALUES.claim,
                month_year: slideData.month_year || DEFAULT_VALUES.month_year
              };
              setInputs(normalizedData);
              updateSlideData(0, normalizedData);
            }
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
        }finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [proposalId, getSlideData, updateSlideData]);

  const handleFileChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      
      setPendingUploads(prev => ({ ...prev, [field]: file }));
      setInputs(prev => ({
        ...prev,
        [field]: {
          type: file.type,
          file: '',
          preview: previewUrl
        }
      }));
      setIsDirty(true);
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
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

      // Handle pending uploads first
      const updatedInputs = { ...inputs };

      // Upload image if pending
      if (pendingUploads.image) {
        const imageUploadResult = await uploadToS3(pendingUploads.image);
        if (!imageUploadResult.success) {
          throw new Error('Failed to upload image');
        }
        updatedInputs.image.file = imageUploadResult.url;
      }

      // Upload logo if pending
      if (pendingUploads.logo) {
        const logoUploadResult = await uploadToS3(pendingUploads.logo);
        if (!logoUploadResult.success) {
          throw new Error('Failed to upload logo');
        }
        updatedInputs.logo.file = logoUploadResult.url;
      }

      // Update backend with new data
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          image: {
            type: updatedInputs.image.type,
            file: updatedInputs.image.file
          },
          logo: {
            type: updatedInputs.logo.type,
            file: updatedInputs.logo.file
          },
          claim: updatedInputs.claim,
          month_year: updatedInputs.month_year
        })
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      // Clear pending uploads and update state
      setPendingUploads({ image: null, logo: null });
      setInputs(updatedInputs);
      setIsDirty(false);
      updateSlideData(0, updatedInputs);

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

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      if (inputs.image?.preview) URL.revokeObjectURL(inputs.image.preview);
      if (inputs.logo?.preview) URL.revokeObjectURL(inputs.logo.preview);
    };
  }, []);

  return (
    <div className="w-full h-full bg-white flex relative" data-slide="0" data-is-dirty={isDirty.toString()}>
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

      {/* Left side with globe */}
      <div className="w-1/2 relative">
        <input
          type="file"
          ref={globeInputRef}
          onChange={(e) => handleFileChange(e, 'image')}
          className="hidden"
          accept="image/*"
        />
        <div 
          className={`w-full h-full relative cursor-pointer ${
            !inputs.image?.file && !inputs.image?.preview ? 'border-2 border-dashed border-gray-300 rounded-r-full flex items-center justify-center' : ''
          }`}
          onClick={() => globeInputRef.current?.click()}
        >
          {(inputs.image?.file || inputs.image?.preview) ? (
            <>
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
            </>
          ) : (
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">+</div>
              Click to upload image
            </div>
          )}
        </div>
      </div>

      {/* Right side with content */}
      <div className="w-1/2 p-8 flex flex-col justify-between">
        {/* Logo section */}
        <div className="mb-8">
          <input
            type="file"
            ref={logoInputRef}
            onChange={(e) => handleFileChange(e, 'logo')}
            className="hidden"
            accept="image/*"
          />
          <div 
            className={`w-48 h-24 flex items-center justify-center cursor-pointer relative ${
              !inputs.logo?.file && !inputs.logo?.preview ? 'border-2 border-dashed border-gray-300' : ''
            }`}
            onClick={() => logoInputRef.current?.click()}
          >
            {(inputs.logo?.file || inputs.logo?.preview) ? (
              <div className="w-full h-full">
                <img 
                  src={inputs.logo.preview || inputs.logo.file} 
                  alt="Company logo"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 hover:opacity-100">
                    Click to change logo
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Click to add logo</span>
            )}
          </div>
        </div>

        {/* Claim section */}
        <div className="mb-8">
          <textarea
            value={inputs.claim}
            onChange={(e) => handleInputChange('claim', e.target.value)}
            className="w-full h-24 p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your company claim (2-3 sentences)"
          />
          {inputs.claim.length > 180 && (
            <div className="text-sm text-gray-500 mt-1">
              {200 - inputs.claim.length} characters remaining
            </div>
          )}
        </div>

        {/* Date section */}
        <div className="mt-auto">
          <div className="whitespace-nowrap overflow-hidden text-5xl font-bold text-green-800 mb-4">
            Investment Proposal
          </div>
          <input
            type="text"
            value={inputs.month_year}
            onChange={(e) => handleInputChange('month_year', e.target.value)}
            className="text-2xl text-green-800 italic focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2"
          />
        </div>

        {/* Save Button */}
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
    </div>
  );
};

export default Slide0;