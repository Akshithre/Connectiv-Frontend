
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/pages/Navbar';
import { useAuth } from '../../contexts/authContext';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ViewInvestorDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { investorId } = useParams();
  const { userDetails } = useAuth();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const proposalId = location.state?.proposalId;
  const [selectedProposal, setSelectedProposal] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("Proposal ID:", proposalId);
  }, [location.state, proposalId]);
  const [formData, setFormData] = useState({
    businessName: '',
    proposalId: '',
    proposalVersion: '',
    investmentNote: '',
    agreeToTerms: false
  });
  const [actionLoading, setActionLoading] = useState(false);
  useEffect(() => {
    const fetchInvestorDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`);
        const data = await response.json();
        
        if (data.status) {
          setInvestor(data.data);
        } else {
          setError('Failed to fetch investor details');
        }
      } catch (error) {
        setError('Error loading investor details');
        toast.error('Failed to fetch investor details');
      } finally {
        setLoading(false);
      }
    };

    const fetchProposals = async () => {
      try {
        if (!userDetails?.userId) {
          throw new Error('User ID not found');
        }

        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userDetails.userId }),
        });
        const data = await response.json();
        if (data.status) {
          setProposals(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch proposals');
        }
      } catch (error) {
        console.error('Error fetching proposals:', error);
        toast.error('Failed to fetch proposals');
      }
    };

    fetchInvestorDetails();
    fetchProposals();
  }, [investorId]);
  
  const handleAcceptAndSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    if (!selectedProposal || !selectedVersion) {
      toast.error('Please select both proposal and version');
      return;
    }

    setActionLoading(true);

    try {
      // Find the selected proposal and version details
      const proposal = proposals.find(p => p._id === selectedProposal);
      const versionDetails = proposal?.proposals?.reduce((found, p) => {
        const version = p.versions?.find(v => v._id === selectedVersion);
        if (version) {
          return {
            proposalNumber: p.proposalNumber,
            versionNumber: version.versionNumber,
            proposalName: version.proposalName
          };
        }
        return found;
      }, null);

      if (!proposal || !versionDetails) {
        throw new Error('Invalid proposal or version selection');
      }

      // First, update the transaction with proposal details
      const updateResponse = await fetch(
        `${API_BASE_URL}/api/transactions/update/proposal/${selectedProposal}/investor/${investorId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            terms_of_investor: termsAccepted,
            business_name: proposal.businessLegalName,
            business_version: `${versionDetails.proposalNumber}/${versionDetails.versionNumber}`,
            contact_business_info: versionDetails.proposalName || '',
            accept_or_reject: 'accept' // Adding the accept action here
          })
        }
      );

      const updateData = await updateResponse.json();

      if (updateData.status) {
        toast.success('Proposal accepted and submitted successfully');
        navigate(-1);
      } else {
        throw new Error(updateData.message || 'Failed to update proposal');
      }
    } catch (error) {
      console.error('Error processing proposal:', error);
      toast.error(error.message || 'Failed to process proposal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/update/proposal/${proposalId}/investor/${investorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accept_or_reject: 'reject'
        })
      });

      const data = await response.json();
      
      if (data.status) {
        toast.success('Transaction rejected successfully');
        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to reject transaction');
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Error rejecting transaction. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Investor Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {investor?.fullName}
                </h1>
                <p className="text-lg text-gray-600">
                  {investor?.entity_designation} at {investor?.entity_name}
                </p>
              </div>

              {/* Main Content */}
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{investor?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{investor?.mobileNo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{investor?.Location?.join(', ')}</span>
                  </div>
                </div>

                {/* Professional Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Professional Background</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {investor?.prof_desc}
                  </p>
                </div>

                {/* Investment Preferences */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Industries of Interest</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor?.interested_industries?.map((industry, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Investment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Preferred Investment Range</h3>
                    <p className="text-lg font-semibold">
                      ₹{Number(investor?.investment_size_pref_min).toLocaleString()} - 
                      ₹{Number(investor?.investment_size_pref_max).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Number of Deals</h3>
                    <p className="text-lg font-semibold">{investor?.no_deals}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Proposal Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Select Business Proposal</h3>
              <form onSubmit={handleAcceptAndSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a proposal</option>
            {proposals.map((proposal) => {
              const activeVersions = proposal.proposals?.some(p => 
                p.versions?.some(v => v.status === 'active')
              );
              
              if (!activeVersions) return null;
              
              return (
                <option key={proposal._id} value={proposal._id}>
                  {proposal.businessLegalName}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Proposal Version
          </label>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a version</option>
            {selectedProposal && proposals
              .find(p => p._id === selectedProposal)?.proposals
              ?.flatMap(proposal => 
                proposal.versions
                  .filter(version => version.status === 'active')
                  .map(version => (
                    <option key={version._id} value={version._id}>
                      Version {proposal.proposalNumber}/{version.versionNumber} - {version.proposalName || 'Untitled'}
                    </option>
                  ))
              )}
          </select>
        </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the terms and conditions of this engagement
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium mt-4"
                >
                  {actionLoading ? 'Processing...' : 'Accept & Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-4 pb-8">
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className={`px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 min-w-[120px] ${
              actionLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {actionLoading ? 'Processing...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}