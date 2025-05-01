import React, { useState, useEffect } from "react";
import Navbar from '../../components/pages/Navbar';
import { useAuth } from "../../contexts/authContext";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProgressSteps = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1, name: 'Register' },
    { id: 2, name: 'Business\nValuation' },
    { id: 3, name: 'Create\nProposal/Pitch' },
    { id: 4, name: 'Find Investors'},
    { id: 5, name: 'Improve\nValuation' }
  ];

  return (
    <div className="flex justify-center items-center my-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center relative">
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${step.id === currentStep 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : step.id < currentStep
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'}`}
            >
              {step.id}
            </button>
            <span 
              className="absolute top-12 w-24 text-xs text-center"
              style={{ whiteSpace: 'pre-line' }}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-24 h-0.5 
                ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

const InvestorCard = ({ investor }) => {
  const navigate = useNavigate();
  const {
    _id,
    fullName = "Not Specified",
    entity_name = "Not Specified",
    entity_designation = "Not Specified",
    Location = [],
    interested_industries = [],
    investment_size_pref_min = "Not Specified",
    investment_size_pref_max = "Not Specified",
    prof_desc = "Not Specified",
    no_deals = "Not Specified"
  } = investor;

  const investmentRange = () => {
    if (investment_size_pref_min && investment_size_pref_max) {
      return `${investment_size_pref_min} - ${investment_size_pref_max}`;
    }
    return "Investment range not specified";
  };

  const primaryLocation = Array.isArray(Location) && Location.length > 0 
    ? Location[0] 
    : "Location not specified";

  const handleContactClick = () => {
    navigate(`/contact-investor/${_id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-[520px] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-xl text-gray-800 mb-2">{fullName}</h3>
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">{entity_name}</span>
            <span className="text-gray-400">•</span>
            <span>{entity_designation}</span>
          </div>
        </div>

        {/* Industries Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Industries of Interest
          </h4>
          <div className="flex flex-wrap gap-2">
            {interested_industries.slice(0, 3).map((industry, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
              >
                {industry}
              </span>
            ))}
            {interested_industries.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{interested_industries.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Investment Details Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Investment Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Investment Range</p>
              <p className="text-sm font-medium text-gray-800">{investmentRange()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Deals Completed</p>
              <p className="text-sm font-medium text-gray-800">{no_deals || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* Location and Description */}
        <div>
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{primaryLocation}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              Profile Description
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {prof_desc}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <button 
          onClick={handleContactClick}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Contact Investor</span>
        </button>
      </div>
    </div>
  );
};

const FindInvestors = () => {
  const [currentStep] = useState(4);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [excludedInvestorIds, setExcludedInvestorIds] = useState(new Set());
  const [connectedInvestors, setConnectedInvestors] = useState(new Set());
  const { userDetails } = useAuth();
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  // Helper function to extract ID from MongoDB object
  const extractId = (mongoObject) => {
    if (!mongoObject) return null;
    if (typeof mongoObject === 'string') return mongoObject;
    if (mongoObject.$oid) return mongoObject.$oid;
    if (mongoObject._id) return typeof mongoObject._id === 'string' ? mongoObject._id : mongoObject._id.$oid;
    return null;
  };

  useEffect(() => {
    const fetchProposalsAndStatus = async () => {
      try {
        const proposalsResponse = await fetch(`${API_BASE_URL}/api/business-proposal/get-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userDetails.userId })
        });
        
        const proposalsData = await proposalsResponse.json();
        if (!proposalsData.status) {
          throw new Error('Failed to fetch proposals');
        }

        // Track connected investors
        const connectedIds = new Set();
        proposalsData.data.forEach(proposal => {
          if (proposal.investorConnections) {
            proposal.investorConnections.forEach(connection => {
              if (connection.status === 'connected') {
                connectedIds.add(extractId(connection.investorId));
              }
            });
          }
        });
        setConnectedInvestors(connectedIds);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        throw err;
      }
    };

    const fetchTransactionsForProposal = async (proposalId) => {
      try {
        console.log('Fetching transactions for proposal:', proposalId);
        const response = await fetch(`${API_BASE_URL}/api/transactions/get-proposal/${proposalId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const transactionsData = await response.json();
        console.log('Transactions data:', transactionsData);
        
        const excludedIds = new Set();

        if (transactionsData.status && Array.isArray(transactionsData.data)) {
          transactionsData.data.forEach(transaction => {
            const investorId = extractId(transaction.investor);
            console.log('Processing transaction for investor:', investorId);
            
            if (transaction.accept_or_reject === 'accept' || transaction.accept_or_reject === 'reject') {
              console.log('Adding to excluded:', investorId);
              if (investorId) {
                excludedIds.add(investorId);
              }
            }
          });
        }

        console.log('Final excluded IDs:', [...excludedIds]);
        return excludedIds;
      } catch (err) {
        console.error('Error fetching transactions for proposal:', err);
        throw err;
      }
    };

    const fetchInvestors = async () => {
      try {
        setLoading(true);
        
        // First fetch proposals to get connected investors
        await fetchProposalsAndStatus();
        
        // If proposalId exists, fetch transactions for that specific proposal
        let excludedIds = new Set();
        if (proposalId) {
          excludedIds = await fetchTransactionsForProposal(proposalId);
        }
        
        setExcludedInvestorIds(excludedIds);

        // Fetch all investors
        const response = await fetch(`${API_BASE_URL}/api/investor/get-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error('Failed to fetch investors');
        }

        const data = await response.json();
        
        if (data.status && Array.isArray(data.data)) {
          setInvestors(data.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching investors:', err);
        setError(err.message);
        toast.error('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };

    if (userDetails?.userId) {
      fetchInvestors();
    }
  }, [userDetails?.userId, proposalId]);

  const filteredInvestors = investors.filter(investor => {
    const investorId = extractId(investor);
    console.log('Filtering investor:', investorId);
    console.log('Current excluded IDs:', [...excludedInvestorIds]);
    
    // Check if investor should be excluded based on transactions
    if (excludedInvestorIds.has(investorId)) {
      console.log('Excluded by transaction:', investorId);
      return false;
    }

    // Check if investor is already connected
    if (connectedInvestors.has(investorId)) {
      console.log('Excluded by connection:', investorId);
      return false;
    }

    // Apply category filter if active
    if (activeCategory !== "all") {
      const investorCategories = (investor.factors || "").toLowerCase().split(',').map(c => c.trim());
      return investorCategories.some(category => category === activeCategory.toLowerCase());
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProgressSteps currentStep={currentStep} onStepClick={() => {}} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Find Investors</h1>
          <p className="text-gray-600">
            Connect with potential investors who match your business needs.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.length > 0 ? (
              filteredInvestors.map((investor) => (
                <InvestorCard key={investor._id} investor={investor} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No investors found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindInvestors;