import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePitchDeck } from '../context/PitchDeckContext';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_VALUES = {
  operationType: '',
  valuationMethod: '',
  sharesOffer: '',
  currency: ''
};

const businessTypeOptions = [
  { value: 'Established Business', label: 'Established Business' },
  { value: 'Startup', label: 'Startup' }
];

const valuationOptions = [
  { value: 'EBITDA', label: 'EBITDA' },
  { value: 'DCF Based', label: 'DCF Based' }
];

const sharesOfferOptions = [
  { value: 'New Issue', label: 'New Issue' },
  { value: 'Existing Stake – Exit', label: 'Existing Stake – Exit' }
];

const currencyOptions = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' }
];

const Dropdown = memo(({ value, options, onChange, placeholder, isActive, onToggle }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="w-full p-4 bg-white border rounded flex items-center justify-between text-gray-700"
    >
      <span>{value || `Select ${placeholder}`}</span>
      <ChevronDown className="w-5 h-5" />
    </button>
    
    {isActive && (
      <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50">
        {options.map((option) => (
          <div
            key={option.value}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              onChange(option.value);
              onToggle();
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    )}
  </div>
));

Dropdown.displayName = 'Dropdown';

const SectionHeader = memo(({ title }) => (
  <div className="bg-[#527853] p-4 rounded">
    <h3 className="text-white text-center">{title}</h3>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

const Slide1 = () => {
  const { updateSlideData, getSlideData } = usePitchDeck();
  const [activeDropdown, setActiveDropdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [isDirty, setIsDirty] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  useEffect(() => {
    const loadSlideData = async () => {
      if (dataLoaded || !proposalId) return;

      try {
        setIsLoading(true);
        
        // First try to get data from context
        const savedData = getSlideData(1);
        if (savedData && Object.keys(savedData).length > 0) {
          setInputs(savedData);
          setDataLoaded(true);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide1/${proposalId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch slide data');
        }

        const data = await response.json();
        
        if (data.status && data.data.slide1) {
          const slideData = data.data.slide1;
          const normalizedData = {
            operationType: slideData.operationType || '',
            valuationMethod: slideData.valuationMethod || '',
            sharesOffer: slideData.sharesOffer || '',
            currency: slideData.currency || ''
          };
          setInputs(normalizedData);
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

    loadSlideData();
  }, [proposalId, getSlideData, dataLoaded]);

  const validateInputs = () => {
    const requiredFields = {
      operationType: 'Business Type',
      valuationMethod: 'Valuation Method',
      sharesOffer: 'Shares Offer',
      currency: 'Currency'
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !inputs[key])
      .map(([, label]) => label);

    if (emptyFields.length > 0) {
      toast.error(`Please select: ${emptyFields.join(', ')}`, {
        toastId: 'validation-error'
      });
      return false;
    }

    return true;
  };

  const handleInputChange = useCallback((field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    if (!proposalId) {
      toast.error('No proposal ID found', {
        toastId: 'no-proposal-id'
      });
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          operationType: inputs.operationType,
          valuationMethod: inputs.valuationMethod,
          sharesOffer: inputs.sharesOffer,
          currency: inputs.currency
        })
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to save slide');
      }

      setIsDirty(false);
      updateSlideData(1, inputs);
      
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

  const toggleDropdown = useCallback((dropdownName) => {
    setActiveDropdown(prev => prev === dropdownName ? '' : dropdownName);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.relative')) {
        setActiveDropdown('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="h-full relative" data-slide="1" data-is-dirty={isDirty.toString()}>
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

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-visible">
        <div className="bg-[#527853] p-4">
          <h2 className="text-white text-center text-xl font-medium">
            Business Transaction Type
          </h2>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SectionHeader title="Select type of business operation" />
            <Dropdown 
              value={inputs.operationType}
              options={businessTypeOptions}
              onChange={(value) => handleInputChange('operationType', value)}
              placeholder="Business Type"
              isActive={activeDropdown === 'Business Type'}
              onToggle={() => toggleDropdown('Business Type')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SectionHeader title="Select Valuation Method" />
            <Dropdown 
              value={inputs.valuationMethod}
              options={valuationOptions}
              onChange={(value) => handleInputChange('valuationMethod', value)}
              placeholder="Valuation Method"
              isActive={activeDropdown === 'Valuation Method'}
              onToggle={() => toggleDropdown('Valuation Method')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SectionHeader title="Shares on Offer" />
            <Dropdown 
              value={inputs.sharesOffer}
              options={sharesOfferOptions}
              onChange={(value) => handleInputChange('sharesOffer', value)}
              placeholder="Shares Offer"
              isActive={activeDropdown === 'Shares Offer'}
              onToggle={() => toggleDropdown('Shares Offer')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SectionHeader title="Select Currency for representing the data" />
            <Dropdown 
              value={inputs.currency}
              options={currencyOptions}
              onChange={(value) => handleInputChange('currency', value)}
              placeholder="Currency"
              isActive={activeDropdown === 'Currency'}
              onToggle={() => toggleDropdown('Currency')}
            />
          </div>
        </div>

        {isDirty && (
          <div className="absolute bottom-4 right-4">
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

export default Slide1;