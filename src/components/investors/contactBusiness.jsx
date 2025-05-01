import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarInvestor from "../../components/pages/NavbarInvestor";
import { Building2, DollarSign, Scale, Clock, MapPin, Users, Briefcase, FileText, BadgeIndianRupee, CircleDollarSign, BarChart4, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '../../contexts/authContext';
import { toast } from 'react-toastify';
import { investorApi } from '../../services/investorApi';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { useLocation } from 'react-router-dom';


const ContactBusiness = () => {
    const { proposalId } = useParams();
    const location = useLocation();
  const navigate = useNavigate();
  const { userDetails, token } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [self_intro, setSelfIntro] = useState('');
  const [termsforInvestor, setTermsforInvestor] = useState(false);
  const [pitchDocument, setPitchDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingTransaction, setExistingTransaction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const investorId = location.state?.investorId;
  console.log('Current investor ID:', investorId);
  console.log('Current proposal ID:', proposalId);
  useEffect(() => {
    if (!investorId) {
        toast.error('Please complete your investor profile first');
        navigate('/investor-home');
        return;
    }

    if (proposalId) {
        Promise.all([fetchProposal(), fetchExistingTransaction()]);
    }
}, [proposalId, investorId, token, userDetails]);
const fetchExistingTransaction = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/transactions/get-by-proposal-investor/${proposalId}/${investorId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status && data.data) {
      setExistingTransaction(data.data);
      setSelfIntro(data.data.contact_business_info);
      setTermsforInvestor(data.data.terms_of_investor);
    }
  } catch (err) {
    console.error('Error fetching transaction:', err);
    // Don't show error to user as this is a background check
  }
};

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      if (data.status && data.data) {
        setProposal(data.data);
        
        // Find the latest proposal and version
        const latestProposal = data.data.proposals?.[0];
        const latestVersion = latestProposal?.versions?.[0];
        
        // Set pitch document if it exists
        if (latestVersion?.documents_proposal?.[0]) {
          const docFile = latestVersion.documents_proposal[0].file;
          const fileName = docFile.split('/').pop() || 'document';
          
          setPitchDocument({
            name: fileName,
            url: docFile
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch proposal data');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'An error occurred while fetching the proposal');
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async (url, filename) => {
    try {
      console.log('Attempting to download from:', url);
      
      // Make the request without credentials
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        // Remove credentials mode
        headers: {
          'Accept': '*/*'
        }
      });
  
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }
  
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Download successful!');
    } catch (err) {
      console.error('Download error:', err);
      
      // More specific error message
      if (err.message.includes('CORS')) {
        toast.error('Unable to access file due to security restrictions. Please contact support.');
      } else {
        toast.error('Unable to download file. Please try again later.');
      }
      
      // Log detailed error for debugging
      console.log('Detailed error information:', {
        url,
        error: err.message
      });
    }
  };
  useEffect(() => {
    if (!investorId) {
      toast.error('Please complete your investor profile first');
      navigate('/investor-home');
      return;
    }
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, investorId]);
  const handleInputChange = (e) => {
    setSelfIntro(e.target.value);
    setIsEditing(true);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!userDetails?.userId) {
    toast.error('User details not found. Please login again');
    navigate('/investor-home');
    return;
  }
  if (!investorId) {
    toast.error('Investor details not found');
    navigate('/investor-home');
    return;
  }
  if (!self_intro.trim()) {
    toast.error('Please introduce yourself');
    return;
  }
  if (!termsforInvestor) {
    toast.error('Please accept the terms and conditions');
    return;
  }

  setSubmitting(true);

  try {
    const transactionData = {
      proposal: proposalId,
      investor: investorId,
      contact_business_info: self_intro,
      terms_of_investor: termsforInvestor
    };

    const response = await fetch(`${API_BASE_URL}/api/transactions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create transaction');
    }

    setExistingTransaction(responseData.data);
    setIsEditing(false);
    toast.success('Request sent successfully! The business owner will be notified via email.');
    
  } catch (err) {
    console.error('Transaction creation error:', err);
    toast.error(err.message || 'Failed to send request');
  } finally {
    setSubmitting(false);
  }
};
  const formatCurrency = (value) => {
    if (!value) return 'Not Available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarInvestor />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarInvestor />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchProposal}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  const latestProposal = proposal?.proposals?.[0]?.versions?.[0];
  const valuation = proposal?.dcfValuation?.valuation || proposal?.ebitdaValuation?.valuation;
  const rating = proposal?.dcfValuation?.rating || proposal?.ebitdaValuation?.rating;
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarInvestor />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Header Section */}
              <div className="border-b pb-6">
                <h2 className="text-2xl font-bold mb-2">{proposal?.businessLegalName}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {proposal?.businessType?.toUpperCase() || 'N/A'}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {proposal?.valuationType?.toUpperCase() || 'N/A'}
                  </span>
                  {rating && (
                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      Rating: {rating}
                    </span>
                  )}
                </div>
              </div>

              {/* Pitch Document Section */}
              {pitchDocument && (
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-3">Pitch Document</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {pitchDocument.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(pitchDocument.url, pitchDocument.name)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Overview Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Quick Overview</h3>
                <p className="text-gray-700">{proposal?.shortBusinessDesc}</p>
              </div>

              {/* Complete Business Description Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Complete Business Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal?.businessDesc || 'Not specified'}</p>
              </div>

              {/* Products & Services Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Products & Services</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal?.keyProducts || 'Not specified'}</p>
              </div>

              {/* Business Strengths Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Business Strengths</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal?.businessStrengths || 'Not specified'}</p>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Legal Entity Type</p>
                    <p className="font-medium">{proposal?.legalEntityType || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Established Year</p>
                    <p className="font-medium">{proposal?.establishedYear || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Financial Overview</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <CircleDollarSign className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Business Valuation</p>
                      <p className="font-medium">{formatCurrency(valuation)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BadgeIndianRupee className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Funding Required</p>
                      <p className="font-medium">
                        {formatCurrency(latestProposal?.equityFundingDetails?.fundingReq?.value)}
                        {latestProposal?.equityFundingDetails?.fundingReq?.currencyType && 
                          ` (${latestProposal?.equityFundingDetails?.fundingReq?.currencyType})`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{proposal?.businessLocation || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{proposal?.industry || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Contact Business</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Introduce yourself and leave a message
                            </label>
                            <textarea
                                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  existingTransaction ? 'bg-gray-100' : ''
                              }`}
                              rows="6"
                              value={self_intro}
                              onChange={handleInputChange}
                              required
                              disabled={existingTransaction !== null}
                              placeholder="Tell us about your interest in this business..."
                          />
                        </div>
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={termsforInvestor}
                                    onChange={(e) => {
                                        setTermsforInvestor(e.target.checked);
                                        setIsEditing(true);
                                    }}
                                    required
                                    disabled={existingTransaction !== null}
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    I agree to the terms and conditions of the engagement
                                </span>
                            </label>
                        </div>
                        <button
                                    type="submit"
                                    className={`w-full py-2 px-4 rounded-md transition-colors duration-300 ${
                                        existingTransaction 
                                            ? 'bg-green-600 text-white cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                    disabled={submitting || !termsforInvestor || existingTransaction !== null}
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Sending Request...
                                        </div>
                                    ) : existingTransaction ? (
                                        'Request Sent'
                                    ) : (
                                        'Send Request'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactBusiness;