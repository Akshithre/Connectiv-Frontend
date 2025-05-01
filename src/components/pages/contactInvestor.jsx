import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/authContext';
import Navbar from '../../components/pages/Navbar';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function ContactInvestor() {
  const navigate = useNavigate();
  const { investorId } = useParams();
  const { userDetails } = useAuth();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const fetchInvestorDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`);
        const data = await response.json();
        if (data.status) {
          setInvestor(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch investor details');
        }
      } catch (error) {
        console.error('Error fetching investor:', error);
        toast.error('Failed to fetch investor details');
      } finally {
        setLoading(false);
      }
    };

    const fetchProposals = async () => {
      try {
        // Use userDetails.userId for filtering
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
  }, [investorId, userDetails?.userId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    if (!selectedProposal || !selectedVersion) {
      toast.error('Please select both proposal and version');
      return;
    }

    // Get full proposal and version details
    const proposal = proposals.find(p => p._id === selectedProposal);
    const versionDetails = proposal?.proposals?.reduce((found, p) => {
      const version = p.versions?.find(v => v._id === selectedVersion);
      if (version) {
        return {
          proposalNumber: p.proposalNumber,
          versionNumber: version.versionNumber,
          proposalName: version.proposalName,
          _id: version._id,
          versionId: `${p.proposalNumber}/${version.versionNumber}`  // This creates the P1/A format
        };
      }
      return found;
    }, null);

    if (!versionDetails) {
      toast.error('Selected version not found');
      return;
    }

    // Navigate with complete data
    navigate('/payment-page', {
      state: {
        investorData: investor,
        proposalData: {
          proposalId: selectedProposal,
          selectedVersion: versionDetails._id,
          versionNumber: versionDetails.versionNumber,
          proposalNumber: versionDetails.proposalNumber,
          proposalName: versionDetails.proposalName,
          versionId: versionDetails.versionId  // This will now be like "P1/A"
        }
      }
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <button 
          onClick={() => navigate('/find-investors')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Investors
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-8/12">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold mb-2">{investor?.fullName}</h2>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{investor?.entity_name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{investor?.entity_designation}</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 space-y-8">
                {/* Industries Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Industries of Interest
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {investor?.interested_industries?.map((industry, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Investment Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Investment Range</p>
                      <p className="text-base font-medium text-gray-800">
                        {investor?.investment_size_pref_min} - {investor?.investment_size_pref_max}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Deals Completed</p>
                      <p className="text-base font-medium text-gray-800">
                        {investor?.no_deals || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location and Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Location
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{investor?.Location?.[0] || "Location not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Professional Summary
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {investor?.prof_desc || "No description available"}
                  </p>
                </div>

                {/* Expectations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Investment Expectations
                  </h3>
                  <p className="text-gray-600">
                    {investor?.expectations || "No expectations specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Selection Form - Right Side */}
          <div className="lg:w-4/12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Select Business Proposal</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium mt-4 flex items-center justify-center"
                >
                  Make Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}