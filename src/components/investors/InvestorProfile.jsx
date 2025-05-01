import React, { useState, useEffect } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavbarInvestor from "../../components/pages/NavbarInvestor";
import { useInvestor } from '../../providers/investorContextProvider';
import { investorApi } from '../../services/investorApi';
import { useAuth } from '../../contexts/authContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const InfoTooltip = ({ text }) => (
  <div className="inline-flex items-center ml-1">
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-gray-500 cursor-help" />
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 w-64 p-2.5 text-sm text-white bg-gray-800 rounded-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
        {text}
        <div className="absolute w-2 h-2 bg-gray-800 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  </div>
);

const Section = ({ title, subtitle, children, showInfoTooltip }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showInfoTooltip && (
          <InfoTooltip text="Information provided here is kept confidential, unless you wish to share forward" />
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const MultiSelectCheckbox = ({ options, selected, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option) => {
    const newSelection = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelection);
  };

  return (
    <div className="relative">
      <label className="block text-sm mb-1">{label}</label>
      <div 
        className="w-full px-3 py-2 border rounded text-sm cursor-pointer bg-white flex justify-between items-center max-w-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selected.length ? selected.join(', ') : 'Select options'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto max-w-md">
          {options.map((option) => (
            <div 
              key={option}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleOption(option)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => {}}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ConfidentialSection = ({ formData, setFormData, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Section 
      title="Register as Investor"
      showInfoTooltip={true}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <label className="block text-sm mb-1">
            <span className="text-red-500">*</span>Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">
            <span className="text-red-500">*</span>Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">
            <span className="text-red-500">*</span>Mobile Number
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${errors.mobileNo ? 'border-red-500' : ''}`}
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">
            Name of the Entity
            <InfoTooltip text="If you are a registered entity" />
          </label>
          <input
            type="text"
            name="entity_name"
            value={formData.entity_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Designation
          </label>
          <input
            type="text"
            name="entity_designation"
            value={formData.entity_designation}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
    </Section>
  );
};
const PreferencesSection = ({ formData, setFormData }) => {
  const industries = ['IT', 'Manufacturing', 'Healthcare']; // Sample industries
  const locations = ['New Delhi', // National Capital
    'Mumbai', // Maharashtra
    'Chennai', // Tamil Nadu
    'Kolkata', // West Bengal
    'Bengaluru', // Karnataka
    'Hyderabad', // Telangana
    'Gandhinagar', // Gujarat
    'Jaipur', // Rajasthan
    'Lucknow', // Uttar Pradesh
    'Bhopal', // Madhya Pradesh
    'Patna', // Bihar
    'Bhubaneswar', // Odisha
    'Raipur', // Chhattisgarh
    'Ranchi', // Jharkhand
    'Thiruvananthapuram', // Kerala
    'Dehradun', // Uttarakhand
    'Chandigarh', // Punjab & Haryana
    'Shimla', // Himachal Pradesh
    'Srinagar', // Jammu & Kashmir (Summer)
    'Jammu', // Jammu & Kashmir (Winter)
    'Itanagar', // Arunachal Pradesh
    'Dispur', // Assam
    'Imphal', // Manipur
    'Shillong', // Meghalaya
    'Aizawl', // Mizoram
    'Kohima', // Nagaland
    'Agartala', // Tripura
    'Gangtok', // Sikkim
    'Panaji', // Goa
    // Union Territories
    'Port Blair', // Andaman & Nicobar Islands
    'Silvassa', // Dadra & Nagar Haveli
    'Daman', // Daman & Diu
    'Kavaratti', // Lakshadweep
    'Puducherry', // Puducherry
    'Leh'  ]; 
  const openToOptions = ['Business Ownership', 'Loans to business'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Section 
      title="Your Preferences"
      subtitle="Information provided here helps us match you with the right business opportunities"
    >
      <div className="space-y-4">
        <MultiSelectCheckbox
          options={industries}
          selected={formData.interested_industries || []}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            interested_industries: selected
          }))}
          label="Industries you are interested in"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Investment Size - Minimum (INR)</label>
            <input
              type="text"
              name="investment_size_pref_min"
              value={formData.investment_size_pref_min}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Investment Size - Maximum (INR)</label>
            <input
              type="text"
              name="investment_size_pref_max"
              value={formData.investment_size_pref_max}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>

        <MultiSelectCheckbox
          options={openToOptions}
          selected={formData.open_to || []}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            open_to: selected
          }))}
          label="You are open to"
        />

        <MultiSelectCheckbox
          options={locations}
          selected={formData.Location || []}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            Location: selected
          }))}
          label="Location preferences"
        />
      </div>
    </Section>
  );
};


const InvestmentHistorySection = ({ formData, setFormData }) => {
  const industries = ['IT', 'Manufacturing', 'Healthcare']; // Sample industries

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (e) => {
    const options = [...e.target.selectedOptions].map(option => option.value);
    setFormData(prev => ({
      ...prev,
      industries: options
    }));
  };

  return (
    <Section title="Investment History (Last 3 Years)">
      <div className="space-y-4">
        <MultiSelectCheckbox
          options={industries}
          selected={formData.industries || []}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            industries: selected
          }))}
          label="Industries"
        />

        <div>
          <label className="block text-sm mb-1">Number of Deals</label>
          <input
            type="text"
            name="no_deals"
            value={formData.no_deals}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Investment Size - Lowest (INR)</label>
            <input
              type="text"
              name="investment_size_his_min"
              value={formData.investment_size_his_min}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Investment Size - Highest (INR)</label>
            <input
              type="text"
              name="investment_size_his_max"
              value={formData.investment_size_his_max}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Profile Description (Min 50 chars)</label>
          <textarea
            name="prof_desc"
            value={formData.prof_desc}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border rounded text-sm"
            minLength={50}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Your Expectations (Min 100 chars)</label>
          <textarea
            name="expectations"
            value={formData.expectations}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border rounded text-sm"
            minLength={100}
          />
        </div>
      </div>
    </Section>
  );
};

const InvestorRegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { investor, setInvestor } = useInvestor();
  const { userDetails } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);


  // Add this function near the top of your component
const areFormDatasEqual = (data1, data2) => {
  // Helper function to clean up data for comparison
  const cleanData = (data) => {
    const cleaned = { ...data };
    
    // Convert all values to strings for consistent comparison and handle empty values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined) {
        cleaned[key] = '';
      } else if (Array.isArray(cleaned[key])) {
        // Handle arrays (like interested_industries, Location, etc.)
        cleaned[key] = JSON.stringify(cleaned[key]);
      } else if (typeof cleaned[key] === 'number') {
        cleaned[key] = cleaned[key].toString();
      }
    });
    return cleaned;
  };

  // Clean both data objects
  const cleanData1 = cleanData(data1);
  const cleanData2 = cleanData(data2);

  // Compare stringified versions of the cleaned data
  return JSON.stringify(cleanData1) === JSON.stringify(cleanData2);
};



  const [formData, setFormData] = useState({
    userId: userDetails?.userId || '',
    fullName: '',
    email: '',
    mobileNo: '',
    entity_name: '',
    entity_designation: '',
    interested_industries: [],
    investment_size_pref_min: '',
    investment_size_pref_max: '',
    open_to: [],
    Location: [],
    industries: [],
    no_deals: '',
    investment_size_his_min: '',
    investment_size_his_max: '',
    prof_desc: '',
    expectations: ''
  });

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    mobileNo: false,
    entity_name: false,
    entity_designation: false
  });
  useEffect(() => {
    if (initialFormData) {
      const hasChanges = !areFormDatasEqual(initialFormData, formData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData]);

  useEffect(() => {
    const investorId = location.state?.investorId;
    if (investorId) {
      fetchInvestorData(investorId);
    }
  }, [location.state?.investorId]);

  const fetchInvestorData = async (investorId) => {
    try {
      const investorData = await investorApi.getInvestorById(investorId);
      const newFormData = {
        ...formData,
        ...investorData
      };
      setFormData(newFormData);
      // Create a deep copy for initial form data
      setInitialFormData(JSON.parse(JSON.stringify(newFormData)));
      setInvestor(investorData);
    } catch (err) {
      console.error('Error fetching investor:', err);
      toast.error('Failed to fetch investor data');
    }
  };
  useEffect(() => {
    const investorId = location.state?.investorId;
    if (!investorId) {
      // For new forms, set initial form data to current empty state
      setInitialFormData(JSON.parse(JSON.stringify(formData)));
    }
  }, []); // Run once on component mount

  const validateForm = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      email: !formData.email.trim(),
      mobileNo: !formData.mobileNo.trim()
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const investorId = location.state?.investorId;
      if (investorId) {
        await investorApi.updateInvestor(investorId, formData);
      } else {
        const response = await investorApi.createInvestor(formData);
        // Update location state with new investorId
        navigate(location.pathname, {
          state: { investorId: response.data._id },
          replace: true
        });
      }
      setInitialFormData({...formData});
      setHasUnsavedChanges(false);
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving form:', err);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };


  const handleNext = () => {
    navigate('/investor-home', {
      state: { 
        investorId: location.state?.investorId,
        shouldRefresh: true
      }
    });
  };

  const handleCancel = () => {
    console.log('Has unsaved changes:', hasUnsavedChanges); // Add for debugging
    if (hasUnsavedChanges) {
      setPendingNavigation('cancel');
      setShowConfirmDialog(true);
      return;
    }
    navigateCancel();
  };
  
  const navigateCancel = () => {
    navigate('/investor-home');
  };
  
  const handleConfirmNavigation = () => {
    setShowConfirmDialog(false);
    if (pendingNavigation === 'cancel') {
      navigateCancel();
    }
    setFormData(initialFormData);
    setHasUnsavedChanges(false);
    setPendingNavigation(null);
    toast.info('Changes have been discarded');
  };
  
  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarInvestor />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Register as Investor</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <ConfidentialSection 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors} 
          />
          
          <PreferencesSection 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          <InvestmentHistorySection 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          <div className="flex justify-center gap-4 mt-8">
      <button 
        type="button"
        onClick={handleCancel}
        className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
          font-medium transition-colors text-sm"
      >
        Cancel
      </button>
      
      <button 
        type="submit"
        disabled={isLoading}
        className={`px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
          font-medium transition-colors text-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        ) : (
          'Save'
        )}
      </button>
      
      <button 
        type="button"
        onClick={handleNext}
        disabled={isLoading || !location.state?.investorId || hasUnsavedChanges}
        className={`px-8 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 
          font-medium transition-colors text-sm ${
            (isLoading || !location.state?.investorId || hasUnsavedChanges) 
            ? 'opacity-75 cursor-not-allowed' 
            : ''
          }`}
      >
        Next
      </button>
    </div>
        </form>

        {showConfirmDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h2 className="text-xl font-semibold mb-4">Unsaved Changes</h2>
      <p className="text-gray-600 mb-6">
        You have unsaved changes. Would you like to discard these changes and restore the previous version?
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancelNavigation}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Keep Changes
        </button>
        <button
          onClick={handleConfirmNavigation}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
        >
          Discard Changes
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default InvestorRegistrationForm;