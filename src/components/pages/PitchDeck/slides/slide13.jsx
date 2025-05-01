import React, { useState, useEffect } from "react";
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { uploadToS3 } from '../../../../utils/s3Utils';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_CONTENT = Array(3).fill().map(() => ({
  description: "",
  image: { type: '', file: '', preview: null }
}));

const Slide13 = () => {
  const { updateSlideData, getSlideData } = usePitchDeck();
  const [contentPairs, setContentPairs] = useState(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(Array(3).fill(null));
  const [dataLoaded, setDataLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const proposalId = location.state?.proposalId;

  useEffect(() => {
    const loadData = async () => {
      if (dataLoaded || !proposalId) return;

      try {
        setIsLoading(true);
        // First try to get data from context
        const savedData = getSlideData(13);
        if (savedData && savedData.contentPairs?.length > 0) {
          setContentPairs(savedData.contentPairs);
          setDataLoaded(true);
          setIsLoading(false);
          return;
        }

        // If no context data and we have proposalId, fetch from API
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide13/${proposalId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.status && data.data.slide13?.contentPairs) {
          const fetchedPairs = data.data.slide13.contentPairs.map(pair => ({
            description: pair.description || '',
            image: {
              type: pair.image?.type || '',
              file: pair.image?.file || '',
              preview: pair.image?.file || null
            }
          }));
          while (fetchedPairs.length < 3) {
            fetchedPairs.push({
              description: "",
              image: { type: '', file: '', preview: null }
            });
          }
          setContentPairs(fetchedPairs);
          updateSlideData(13, { contentPairs: fetchedPairs });
        }
      } catch (error) {
        console.error('Error loading slide data:', error);
        toast.error('Failed to load slide data', {
          toastId: 'load-error'
        });
      } finally {
        setIsLoading(false);
        setDataLoaded(true);
      }
    };

    loadData();
  }, [proposalId, getSlideData, updateSlideData, dataLoaded]);

  // Add navigation interceptor
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleLocationChange = () => {
      if (hasUnsavedChanges) {
        const userChoice = window.confirm('You have unsaved changes! Would you like to save them before leaving?');
        if (userChoice) {
          handleSaveChanges();
        }
        return userChoice;
      }
      return true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [hasUnsavedChanges]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      
      setPendingUploads(prev => {
        const newUploads = [...prev];
        newUploads[index] = file;
        return newUploads;
      });

      setContentPairs(prev => {
        const newPairs = [...prev];
        newPairs[index] = {
          ...newPairs[index],
          image: {
            type: file.type,
            file: '',
            preview: previewUrl
          }
        };
        return newPairs;
      });
      
      setHasUnsavedChanges(true);
    }
  };

  const handleDescriptionChange = (e, index) => {
    setContentPairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = {
        ...newPairs[index],
        description: e.target.value
      };
      return newPairs;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!proposalId) {
      toast.error('No proposal ID found', {
        toastId: 'no-proposal-id'
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updatedContentPairs = [...contentPairs];
      
      for (let i = 0; i < pendingUploads.length; i++) {
        if (pendingUploads[i]) {
          try {
            const uploadResult = await uploadToS3(pendingUploads[i]);
            if (uploadResult.success) {
              updatedContentPairs[i].image = {
                type: pendingUploads[i].type,
                file: uploadResult.url,
                preview: null
              };
            } else {
              throw new Error(`Failed to upload image ${i + 1}`);
            }
          } catch (error) {
            throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide13`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          contentPairs: updatedContentPairs.map(pair => ({
            description: pair.description,
            image: {
              type: pair.image.type,
              file: pair.image.file
            }
          }))
        })
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      setPendingUploads(Array(3).fill(null));
      setContentPairs(updatedContentPairs);
      setHasUnsavedChanges(false);
      updateSlideData(13, { contentPairs: updatedContentPairs });

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

  useEffect(() => {
    return () => {
      contentPairs.forEach(pair => {
        if (pair.image?.preview && !pair.image.file) {
          URL.revokeObjectURL(pair.image.preview);
        }
      });
    };
  }, []);

  return (
    <div className="w-full h-full p-4 bg-gray-100 flex flex-col items-center" data-slide="13" data-is-dirty={hasUnsavedChanges.toString()}>
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
      
      <div className="bg-[#527853] w-full text-white p-4 text-center rounded-md shadow-md mb-6">
        <h2 className="text-xl font-semibold">Upload Your Images and Descriptions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {contentPairs.map((pair, index) => (
          <div key={index} className="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg border border-gray-300">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#527853]"
              placeholder={`Enter description ${index + 1}...`}
              value={pair.description}
              onChange={(e) => handleDescriptionChange(e, index)}
              rows={3}
            />
            <div className="w-full h-40 flex items-center justify-center border border-dashed border-gray-400 rounded-md mb-3">
              {(pair.image?.file || pair.image?.preview) ? (
                <div className="relative w-full h-full">
                  <img 
                    src={pair.image.preview || pair.image.file}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity">
                    <label className="text-white cursor-pointer opacity-0 hover:opacity-100">
                      Click to change
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, index)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="text-sm text-[#527853] cursor-pointer">
                  Click to upload image
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, index)}
                    accept="image/*"
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasUnsavedChanges && (
        <button
          onClick={handleSaveChanges}
          disabled={isLoading}
          className={`mt-6 px-6 py-2 rounded-md text-white ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#527853] hover:bg-[#3d5e42] cursor-pointer"
          }`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default Slide13;