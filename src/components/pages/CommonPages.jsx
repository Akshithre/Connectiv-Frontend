import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../../components/pages/Navbar";
import ChatSection from "./ChatSection";
import NavbarInvestor from "../../components/pages/NavbarInvestor";
const CommonPage = () => {
  const [businessData, setBusinessData] = useState(null);
  const [investorData, setInvestorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { proposalId, investorId, source = 'business'  } = location.state || {};
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    if (!proposalId || !investorId) {
      navigate('/');
      return;
    }
  }, [proposalId, investorId, navigate]);
  const fetchTransactionDetails = async (proposalId, investorId) => {
    try {
      console.log('Fetching transaction details for:', { proposalId, investorId });
  
      const response = await fetch(`${API_BASE_URL}/api/transactions/get-by-proposal-investor/${proposalId}/${investorId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transaction API response:', data);
      
      if (!data.data) {
        return null;
      }
  
      return data.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  };
  // ... other fetch functions remain the same ...

  const findProposalVersion = () => {
    console.log('Starting findProposalVersion with:', {
      transactionData,
      businessData,
      investorId
    });
  
    // First try to get version from transaction data
    if (transactionData?.business_version) {
      try {
        const [proposalNumber, versionLetter] = transactionData.business_version.split('/');
        const matchingProposal = businessData?.proposals?.find(
          proposal => proposal.proposalNumber === proposalNumber
        );
        return matchingProposal?.versions?.find(
          version => version.versionNumber === versionLetter
        );
      } catch (error) {
        console.error('Error processing transaction version:', error);
      }
    }
    
    // If no transaction data or version not found, try investor connections
    const investorConnection = businessData?.investorConnections?.find(
      conn => conn.investorId.$oid === investorId || conn.investorId === investorId
    );
    
    if (investorConnection?.selectedProposal?.versionId) {
      try {
        const [proposalNumber, versionLetter] = investorConnection.selectedProposal.versionId.split('/');
        const matchingProposal = businessData?.proposals?.find(
          proposal => proposal.proposalNumber === proposalNumber
        );
        return matchingProposal?.versions?.find(
          version => version.versionNumber === versionLetter
        );
      } catch (error) {
        console.error('Error processing investor connection version:', error);
      }
    }
    
    // If still no version found, try to get the first version from first proposal
    if (businessData?.proposals?.[0]?.versions?.[0]) {
      return businessData.proposals[0].versions[0];
    }
    
    return null;
  };

  const fetchBusinessDetails = async (proposalId) => {
    try {
      console.log('Fetching business details for:', proposalId);
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`);
      const data = await response.json();
      console.log('Business response:', data);
      if (data.status) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching business details:', error);
      return null;
    }
  };

  const fetchInvestorDetails = async (investorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`);
      const data = await response.json();
      if (data.status) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching investor details:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!proposalId || !investorId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        const business = await fetchBusinessDetails(proposalId);
        setBusinessData(business);
        
        const [investor, transaction] = await Promise.all([
          fetchInvestorDetails(investorId),
          fetchTransactionDetails(proposalId, investorId)
        ]);

        console.log('All data fetched:', {
          business,
          investor,
          transaction
        });
        
        setInvestorData(investor);
        setTransactionData(transaction);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId, investorId, navigate]);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  

  return (
    <div className="min-h-screen bg-gray-50">
      {source === 'investor' ? <NavbarInvestor /> : <Navbar />}
      <div className="container mx-auto px-6 py-8 flex gap-6">
        {/* Left side - Business and Investor Details */}
        <div className="w-1/2">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="flex flex-col gap-8">
               <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-blue-700 mb-6">Investor Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 font-medium">Profile Description</p>
                    <p className="whitespace-pre-wrap">{investorData?.prof_desc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Interested Industries</p>
                    <p>{investorData?.interested_industries?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Investment Size Preference</p>
                    <p>
                      {investorData?.investment_size_pref_min && investorData?.investment_size_pref_max
                        ? `₹${investorData.investment_size_pref_min} - ₹${investorData.investment_size_pref_max}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Location</p>
                    <p>{investorData?.Location?.join(', ') || 'N/A'}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment History (Last 3 Years)</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-600 font-medium">Industries</p>
                        <p>{investorData?.industries?.join(', ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Number of Deals</p>
                        <p>{investorData?.no_deals || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Investment Size Range</p>
                        <p>
                          {investorData?.investment_size_his_min && investorData?.investment_size_his_max
                            ? `₹${investorData.investment_size_his_min} - ₹${investorData.investment_size_his_max}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-gray-600 font-medium">Last Updated</p>
                    <p>{investorData?.updatedAt ? formatDate(investorData.updatedAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              {/* Selected Proposal Version Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button 
                  onClick={() => setIsProposalOpen(!isProposalOpen)}
                  className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-2xl font-bold text-purple-700">Proposal Details</h2>
                  <svg 
                    className={`w-6 h-6 transform transition-transform ${isProposalOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isProposalOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="p-6 border-t">
  {(() => {
      const proposalVersion = findProposalVersion();
      
      // If no version found at all
      if (!proposalVersion) {
        return (
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Version Selected</h3>
              <p className="text-yellow-700">
                No proposal version was found for this business and investor combination.
              </p>
            </div>
          </div>
        );
      }
      const versionId = transactionData?.business_version || 
                    businessData?.investorConnections?.find(
                      conn => conn.investorId.$oid === investorId || conn.investorId === investorId
                    )?.selectedProposal?.versionId || 
                    `${businessData?.proposals?.[0]?.proposalNumber}/${proposalVersion.versionNumber}`;
      
      // If we have a version, display its details
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Investment Proposal</h3>
          
          <div>
            <p className="text-gray-600 font-medium">Short Description of Proposal</p>
            <p className="whitespace-pre-wrap">{proposalVersion.proposalDesc}</p>
          </div>
          
          <div>
            <p className="text-gray-500 italic">Version: {versionId}</p>
          </div>
          
          <div>
  <p className="text-gray-600 font-bold">Offer for Sale / Partial exit by existing shareholders</p>
  <p>{proposalVersion.investment_offer || 'N/A'}</p>
</div>
          
          <div>
            <p className="text-gray-600 font-medium">Category</p>
            <p>
              {businessData?.establishedYear ? "Established business" : "Start-up with revenue projections"}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Industry</p>
            <p>{businessData?.industry || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Location</p>
            <p>{businessData?.businessLocation || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Business Description</p>
            <p className="whitespace-pre-wrap">{proposalVersion.businessDesc || businessData?.businessDesc || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">Products / Services</p>
            <p className="whitespace-pre-wrap">{proposalVersion.products || businessData?.keyProducts || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-600 font-medium">No. of Interests Received</p>
            <p>{businessData?.investorConnections?.length || 0}</p>
          </div>
      
          {/* {proposalVersion.documents_proposal && proposalVersion.documents_proposal.length > 0 && (
            <div>
              <p className="text-gray-600 font-medium mb-2">Documents</p>
              <div className="space-y-2">
                {proposalVersion.documents_proposal.map((doc, index) => (
                  <div key={doc._id.$oid || index} className="flex items-center">
                    <a 
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      );
    })()}
  </div>
  </div>
  </div>
             

              {/* Business Details Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button 
                  onClick={() => setIsBusinessOpen(!isBusinessOpen)}
                  className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-2xl font-bold text-green-700">Business Details</h2>
                  <svg 
                    className={`w-6 h-6 transform transition-transform ${isBusinessOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isBusinessOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="p-6 border-t">
                    <div className="space-y-4">
                    <div>
          <p className="text-gray-600 font-medium">Rating</p>
          <p>{businessData?.valuationType === 'ebitda' 
              ? businessData?.ebitdaValuation?.rating 
              : businessData?.dcfValuation?.rating || 'N/A'}</p>
        </div>
                  <div>
                    <p className="text-gray-600 font-medium">Legal Entity Type</p>
                    <p>{businessData?.legalEntityType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Established Year</p>
                    <p>{businessData?.establishedYear || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Industry</p>
                    <p>{businessData?.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Business Description</p>
                    <p className="whitespace-pre-wrap">{businessData?.businessDesc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Business Strengths</p>
                    <p className="whitespace-pre-wrap">{businessData?.businessStrengths || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Annual Sales</p>
                    <p>{businessData?.annualSales ? `₹${businessData.annualSales}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Annual EBITDA</p>
                    <p>{businessData?.annualEBITDA ? `₹${businessData.annualEBITDA}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Total Assets</p>
                    <p>{businessData?.totalAssets ? `₹${businessData.totalAssets}` : 'N/A'}</p>
                  </div>
                </div>
              </div>              
            </div>
            </div>
            </div>
          )}
        </div>

        {/* Right side - Chat Section */}
        <div className="w-1/2">
          {proposalId && investorId && (
            <ChatSection 
              proposalId={proposalId} 
              investorId={investorId}
              businessData={businessData}
              investorData={investorData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonPage;
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Navbar from "../../components/pages/Navbar";
// import ChatSection from "./ChatSection";

// const CommonPage = () => {
//   const [businessData, setBusinessData] = useState(null);
//   const [investorData, setInvestorData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [transactionData, setTransactionData] = useState(null);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { proposalId, investorId } = location.state || {};
//   const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

//   const fetchTransactionDetails = async (proposalId, investorId) => {
//     try {
//       console.log('Fetching transaction details for:', { proposalId, investorId });
  
//       const response = await fetch(`${API_BASE_URL}/api/transactions/get-by-proposal-investor/${proposalId}/${investorId}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Transaction API response:', data);
      
//       // If no transaction data, return null
//       if (!data.data) {
//         return null;
//       }
  
//       return data.data;
//     } catch (error) {
//       console.error('Error fetching transaction details:', error);
//       return null;
//     }
//   };

//   // ... other fetch functions remain the same ...

//   const findProposalVersion = () => {
//     console.log('Starting findProposalVersion with:', {
//       transactionData,
//       businessData,
//       investorId
//     });
  
//     // If we have transaction data, use the business_version from there
//     if (transactionData?.business_version) {
//       try {
//         const [proposalNumber, versionLetter] = transactionData.business_version.split('/');
//         const matchingProposal = businessData?.proposals?.find(
//           proposal => proposal.proposalNumber === proposalNumber
//         );
//         return matchingProposal?.versions?.find(
//           version => version.versionNumber === versionLetter
//         );
//       } catch (error) {
//         console.error('Error processing transaction version:', error);
//         return null;
//       }
//     }
    
//     // If no transaction data, look for version in investorConnections
//     const investorConnection = businessData?.investorConnections?.find(
//       conn => conn.investorId.$oid === investorId || conn.investorId === investorId
//     );
    
//     if (investorConnection?.selectedProposal?.versionId) {
//       try {
//         const [proposalNumber, versionLetter] = investorConnection.selectedProposal.versionId.split('/');
//         const matchingProposal = businessData?.proposals?.find(
//           proposal => proposal.proposalNumber === proposalNumber
//         );
//         return matchingProposal?.versions?.find(
//           version => version.versionNumber === versionLetter
//         );
//       } catch (error) {
//         console.error('Error processing investor connection version:', error);
//         return null;
//       }
//     }
    
//     return null;
//   };

//   const fetchBusinessDetails = async (proposalId) => {
//     try {
//       console.log('Fetching business details for:', proposalId);
//       const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`);
//       const data = await response.json();
//       console.log('Business response:', data);
//       if (data.status) {
//         return data.data;
//       }
//       return null;
//     } catch (error) {
//       console.error('Error fetching business details:', error);
//       return null;
//     }
//   };

//   const fetchInvestorDetails = async (investorId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`);
//       const data = await response.json();
//       if (data.status) {
//         return data.data;
//       }
//       return null;
//     } catch (error) {
//       console.error('Error fetching investor details:', error);
//       return null;
//     }
//   };

//  useEffect(() => {
//   if (!proposalId || !investorId) {
//     navigate('/');
//     return;
//   }

//   const fetchData = async () => {
//     try {
//       console.log('Starting to fetch data...');
//       // First fetch business data
//       const business = await fetchBusinessDetails(proposalId);
//       setBusinessData(business);
      
//       // Then fetch transaction and investor details with access to business data
//       const [investor, transaction] = await Promise.all([
//         fetchInvestorDetails(investorId),
//         fetchTransactionDetails(proposalId, investorId)
//       ]);

//       console.log('All data fetched:', {
//         business,
//         investor,
//         transaction
//       });
      
//       setInvestorData(investor);
//       setTransactionData(transaction);
//     } catch (error) {
//       console.error('Error in fetchData:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, [proposalId, investorId, navigate]);

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

  

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="container mx-auto px-6 py-8 flex gap-6">
//         {/* Left side - Business and Investor Details */}
//         <div className="w-1/2">
//           {loading ? (
//             <div className="text-center">Loading...</div>
//           ) : (
//             <div className="flex flex-col gap-8">
//               {/* Selected Proposal Version Card */}
//               {/* Selected Proposal Version Card */}
// {/* Selected Proposal Version Card */}
// {/* Selected Proposal Version Card */}
// <div className="bg-white rounded-lg shadow-lg p-6">
//   <h2 className="text-2xl font-bold text-purple-700 mb-6">Selected Proposal Version</h2>
//   {(() => {
//     // If no transaction data at all
//     if (!transactionData) {
//       return (
//         <div className="space-y-4">
//           <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
//             <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Transaction Found</h3>
//             <p className="text-yellow-700">
//               There is no active transaction record for this proposal and investor combination.
//             </p>
//           </div>
//         </div>
//       );
//     }

//     // Try to get version from business data if not in transaction
//     let businessVersion = transactionData.business_version;
//     if (!businessVersion && businessData?.proposals?.[0]?.versions?.[0]) {
//       businessVersion = `${businessData.proposals[0].proposalNumber}/${businessData.proposals[0].versions[0].versionNumber}`;
//     }

//     if (!businessVersion) {
//       return (
//         <div className="p-4 border border-red-200 bg-red-50 rounded-md">
//           <h3 className="text-lg font-semibold text-red-800 mb-2">Version Information Missing</h3>
//           <p className="text-red-700">
//             The business version information is missing from the transaction data.
//           </p>
//         </div>
//       );
//     }

//     const [proposalNumber, versionLetter] = businessVersion.split('/');
//     console.log('Looking for proposal:', proposalNumber, 'version:', versionLetter);
    
//     const matchingProposal = businessData?.proposals?.find(
//       proposal => proposal.proposalNumber === proposalNumber
//     );
//     console.log('Matching Proposal:', matchingProposal);
    
//     const proposalVersion = matchingProposal?.versions?.find(
//       version => version.versionNumber === versionLetter
//     );
//     console.log('Proposal Version:', proposalVersion);

//     if (!proposalVersion) {
//       return (
//         <div className="p-4 border border-red-200 bg-red-50 rounded-md">
//           <h3 className="text-lg font-semibold text-red-800 mb-2">Version Not Found</h3>
//           <p className="text-red-700">
//             The specified version ({businessVersion}) could not be found in the proposal details.
//           </p>
//         </div>
//       );
//     }
      
//       return (
//         <div className="space-y-4">
//           <div>
//             <p className="text-gray-600 font-medium">Version</p>
//             <p>{transactionData.business_version}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Proposal Name</p>
//             <p>{proposalVersion.proposalName}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Proposal Description</p>
//             <p className="whitespace-pre-wrap">{proposalVersion.proposalDesc}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Business Description</p>
//             <p className="whitespace-pre-wrap">{proposalVersion.businessDesc}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Products</p>
//             <p className="whitespace-pre-wrap">{proposalVersion.products}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Proposal Type</p>
//             <p>{proposalVersion.proposalType}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Current Valuation</p>
//             <p>₹{proposalVersion.currentValuation}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 font-medium">Current Shares</p>
//             <p>{proposalVersion.currentShares}</p>
//           </div>
//         </div>
//       );
//     })()}
//   </div>

//               {/* Business Details Card */}
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <h2 className="text-2xl font-bold text-green-700 mb-6">Business Details</h2>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-gray-600 font-medium">Rating</p>
//                     <p>{businessData?.rating || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Legal Entity Type</p>
//                     <p>{businessData?.legalEntityType || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Established Year</p>
//                     <p>{businessData?.establishedYear || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Industry</p>
//                     <p>{businessData?.industry || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Business Description</p>
//                     <p className="whitespace-pre-wrap">{businessData?.businessDesc || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Business Strengths</p>
//                     <p className="whitespace-pre-wrap">{businessData?.businessStrengths || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Annual Sales</p>
//                     <p>{businessData?.annualSales ? `₹${businessData.annualSales}` : 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Annual EBITDA</p>
//                     <p>{businessData?.annualEBITDA ? `₹${businessData.annualEBITDA}` : 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Total Assets</p>
//                     <p>{businessData?.totalAssets ? `₹${businessData.totalAssets}` : 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Investor Details Card */}
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <h2 className="text-2xl font-bold text-blue-700 mb-6">Investor Details</h2>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-gray-600 font-medium">Profile Description</p>
//                     <p className="whitespace-pre-wrap">{investorData?.prof_desc || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Interested Industries</p>
//                     <p>{investorData?.interested_industries?.join(', ') || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Investment Size Preference</p>
//                     <p>
//                       {investorData?.investment_size_pref_min && investorData?.investment_size_pref_max
//                         ? `₹${investorData.investment_size_pref_min} - ₹${investorData.investment_size_pref_max}`
//                         : 'N/A'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 font-medium">Location</p>
//                     <p>{investorData?.Location?.join(', ') || 'N/A'}</p>
//                   </div>

//                   <div className="border-t pt-4">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment History (Last 3 Years)</h3>
//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-gray-600 font-medium">Industries</p>
//                         <p>{investorData?.industries?.join(', ') || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-600 font-medium">Number of Deals</p>
//                         <p>{investorData?.no_deals || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-600 font-medium">Investment Size Range</p>
//                         <p>
//                           {investorData?.investment_size_his_min && investorData?.investment_size_his_max
//                             ? `₹${investorData.investment_size_his_min} - ₹${investorData.investment_size_his_max}`
//                             : 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="border-t pt-4">
//                     <p className="text-gray-600 font-medium">Last Updated</p>
//                     <p>{investorData?.updatedAt ? formatDate(investorData.updatedAt) : 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right side - Chat Section */}
//         <div className="w-1/2">
//           {proposalId && investorId && (
//             <ChatSection 
//               proposalId={proposalId} 
//               investorId={investorId}
//               businessData={businessData}
//               investorData={investorData}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CommonPage;