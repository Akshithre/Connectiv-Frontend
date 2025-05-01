// src/components/pages/PitchDeck/context/PitchDeckContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PitchDeckContext = createContext();
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const initialSlideState = {
  slide0: {},
  slide1: {},
  slide2: {},
  slide3: {},
  slide4: {},
  slide5: {},
  slide6: {},
  slide7: {},
  slide8: {},
  slide9: {},
  slide10: {},
  slide11: {},
  slide12: {},
  slide13: {},
  slide14: {}
};

export const PitchDeckProvider = ({ children }) => {
  const [slideData, setSlideData] = useState(initialSlideState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  // Function to fetch slide data from backend
  const fetchSlideData = async (slideNumber) => {
    if (!proposalId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide${slideNumber}/${proposalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message);
      }

      // Find data for specific proposal
      if (data.data) {
        setSlideData(prev => ({
          ...prev,
          [`slide${slideNumber}`]: data.data.slide0 || {}
        }));
      }
    } catch (error) {
      console.error(`Error fetching slide ${slideNumber}:`, error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update slide data in backend
 // In PitchDeckContext.jsx

const updateSlideInBackend = async (slideNumber, data) => {
  if (!proposalId) return;

  try {
    setIsLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide${slideNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposalId,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    if (!responseData.status) {
      throw new Error(responseData.message || 'Failed to update slide');
    }

    return responseData.data;
  } catch (error) {
    console.error(`Error updating slide ${slideNumber}:`, error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // Function to update slide data
  const updateSlideData = async (slideNumber, data) => {
    try {
      // Update local state immediately for better UX
      setSlideData(prev => ({
        ...prev,
        [`slide${slideNumber}`]: {
          ...(prev[`slide${slideNumber}`] || {}),
          ...data
        }
      }));

      // Update backend
      if (proposalId) {
        await updateSlideInBackend(slideNumber, data);
      }
    } catch (error) {
      console.error(`Error updating slide ${slideNumber}:`, error);
      setError(error.message);
      // Revert to previous state if backend update fails
      await fetchSlideData(slideNumber);
    }
  };

  // Function to get slide data
  const getSlideData = (slideNumber) => {
    return slideData[`slide${slideNumber}`] || {};
  };

  // Function to load slide data
  const loadSlideData = async (slideNumber) => {
    await fetchSlideData(slideNumber);
  };

  // Load initial data when proposalId changes
  useEffect(() => {
    if (proposalId) {
      // Load data for all slides
      Promise.all([...Array(15)].map((_, i) => fetchSlideData(i)));
    }
  }, [proposalId]);

  const clearSlideData = (slideNumber) => {
    setSlideData(prev => ({
      ...prev,
      [`slide${slideNumber}`]: {}
    }));
  };

  const clearAllData = () => {
    setSlideData(initialSlideState);
  };

  const value = {
    slideData,
    updateSlideData,
    getSlideData,
    loadSlideData,
    clearSlideData,
    clearAllData,
    isLoading,
    error,
    proposalId
  };

  return (
    <PitchDeckContext.Provider value={value}>
      {children}
    </PitchDeckContext.Provider>
  );
};

export const usePitchDeck = () => {
  const context = useContext(PitchDeckContext);
  if (!context) {
    throw new Error('usePitchDeck must be used within a PitchDeckProvider');
  }
  return context;
};

export default PitchDeckContext;