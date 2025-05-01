import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Info, 
  Trash2, 
  AlertCircle,
  X 
} from "lucide-react";
import Navbar from "../../components/pages/Navbar";
import { useAuth } from "../../contexts/authContext";
// import info from "../../assets/info.png";
import info3 from "../../assets/info3.png";
import InvestorConnects from './InvestorConnects';
import TransactionBasedInvestors from "./transactioncards_home";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


const HoldRequestModal = ({ isOpen, onClose, onSubmit, proposalName }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request Hold for {proposalName}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Hold Request
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const clearRejectionReason = async (proposalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/business-proposal/clear-rejection-reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proposalId }),
    });

    if (!response.ok) throw new Error('Failed to clear rejection reason');
    
    // Local state update handled by parent through onDismiss
  } catch (error) {
    console.error('Error clearing rejection reason:', error);
  }
};

const RejectionNotification = ({ proposal, onDismiss, onRequestAgain }) => {
  if (!proposal.rejectionReason) return null;

  const handleDismiss = async () => {
    await clearRejectionReason(proposal._id);
    onDismiss();
  };

  const handleRequestAgain = async (proposalId) => {
    try {
      // First clear the rejection reason
      await clearRejectionReason(proposalId);
      
      // Update local state to remove the rejection message
      onDismiss();
      
      // Then open the hold modal
      onRequestAgain(proposalId);
    } catch (error) {
      console.error('Error handling request again:', error);
    }
  };

  return (
    <div className="relative mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 pr-10 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Hold Request Rejected for {proposal.businessLegalName}
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Reason: {proposal.rejectionReason}
          </p>
          <div className="mt-3">
            <button
              onClick={() => handleRequestAgain(proposal._id)}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Request Hold Again
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
const BusinessProfileCard = ({ proposal, onEdit, onRequestHold, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 relative min-h-[420px]">
      <button
        onClick={() => onDelete(proposal._id, proposal.businessLegalName)}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        title="Delete business profile"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="mb-8">
  <div className="flex items-center gap-3 mb-2">
    <h3 className="text-green-700 text-xl font-medium">
      {proposal.businessLegalName}
    </h3>
    <div className={`px-3 py-1 rounded-full text-sm ${
      proposal.status === 'active' ? 'bg-green-100 text-green-800' :
      proposal.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
      proposal.status === 'requested' ? 'bg-blue-100 text-blue-800' :
      'bg-green-100 text-green-800'
    }`}>
      {proposal.status === 'requested' ? 'Hold Requested' :
       proposal.status === 'hold' ? 'On Hold' :
       'Active'}
    </div>
  </div>
  <h4 className="text-gray-700 font-medium">
    Established in {proposal.establishedYear}, {proposal.businessLocation}
  </h4>
</div>

      <div className="space-y-4 mb-8">
        <div>
          <div className="text-sm text-gray-600">Short Description:</div>
          <p className="font-medium">{proposal.shortBusinessDesc}</p>
        </div>

        <div>
          <div className="text-sm text-gray-600">Products (or) Services:</div>
          <p className="font-medium">{proposal.keyProducts}</p>
        </div>

        <div>
          <div className="text-sm text-gray-600">Monthly Sales</div>
          <p className="font-medium">₹ {proposal.monthlySales}</p>
        </div>

        <div>
          <div className="text-sm text-gray-600">EBITDA (last yr) / Margin %:</div>
          <p className="font-medium">₹ {proposal.annualEBITDA}</p>
        </div>

        <div>
          <div className="text-sm text-gray-600">Total Assets:</div>
          <p className="font-medium">₹ {proposal.totalAssets}</p>
        </div>

        <div className="pb-16">
          <div className="text-sm text-gray-600">Total Liabilities:</div>
          <p className="font-medium">₹ {proposal.totalLiabilities}</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex gap-4 justify-end">
        {/* {proposal.status === 'active' && (
          <button
            onClick={() => onRequestHold(proposal._id)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Request Hold
          </button>
        )} */}
        <button
          onClick={() => onEdit(proposal._id)}
          className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded transition-colors text-white font-medium shadow-sm hover:shadow-md"
        >
          Edit details
        </button>
      </div>
    </div>
  );
};


const BusinessProposalsColumn = ({ 
  loading, 
  error, 
  proposals, 
  handleCreateProposal, 
  handleEditProposal, 
  openHoldModal, 
  initiateDelete, 
  setProposals 
}) => {
  return (
    <div className="relative">
      <StepHeader number="1" title="My Business Profile" />
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg h-64"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <h1 className="text-xl font-black mb-4">
              List your businesses on Hubridge M&A
            </h1>
            <p className="text-gray-600 mb-8">
              Get visibility from 110,000+ member network of Businesses,
              Investors, Acquirers, Lenders and Advisors from 900+ Industries
              and 170+ Countries
            </p>
            <button
              className="w-full bg-blue-400 hover:bg-green-700 text-gray-800 font-medium py-2 rounded transition-colors"
              onClick={handleCreateProposal}
            >
              Create Business Profile
            </button>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal._id} className="relative">
              {proposal.rejectionReason && (
                <RejectionNotification
                  proposal={proposal}
                  onDismiss={async () => {
                    setProposals(prevProposals =>
                      prevProposals.map(p =>
                        p._id === proposal._id
                          ? { ...p, rejectionReason: null }
                          : p
                      )
                    );
                  }}
                  onRequestAgain={(proposalId) => {
                    openHoldModal(proposalId);
                  }}
                />
              )}
              <div
                className="absolute right-0 top-1/2 w-8 h-px bg-gray-200 -mr-8"
                style={{ transform: "translateY(-50%)" }}
              ></div>
              <BusinessProfileCard
                proposal={proposal}
                onEdit={handleEditProposal}
                onRequestHold={openHoldModal}
                onDelete={initiateDelete}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NewUserView = ({ onCreateProfile }) => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-3 flex justify-center gap-16">
        {" "}
        {/* Updated container styling */}
        {/* Left Side - Keep original size */}
        <div className="w-[35%] p-12 bg-white border-2 border-green-800 rounded-lg my-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            Business Owners
          </h2>
          <p className="mb-8 text-gray-600">
            Join our Portal SME Investor Hub to accelerate your fund raise
            plans.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Register on our portal for Free</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Get free Business Valuation</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Prepare Fund Raise Proposal</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">
                4
              </div>
              <div>
                <p className="font-medium">
                  Connect with Investors & Close deals
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="w-[25%] p-11 bg-gray-50 mx-9 my-14 rounded-lg">
          {/* Reduced width from 30% to 25% and padding from p-8 to p-6 */}
          <div className="w-[220px] h-[160px] flex flex-col">
            {/* Reduced width from 250px to 220px and height from 180px to 160px */}
            <h2 className="text-xl font-bold mb-3">
              List your businesses on Hubridge M&A
            </h2>
            <p className="text-gray-600 mb-3 text-md leading-relaxed">
              Get visibility from 110,000+ member network of Businesses,
              Investors, Acquirers, Lenders and Advisors from 900+ Industries
              and 170+ Countries
            </p>
            <button
              onClick={onCreateProfile}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-9"
            >
              Create Business Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepHeader = ({ number, title }) => (
  <div className="flex items-center gap-4 mb-6 bg-white rounded-lg shadow p-4 border-l-4 border-green-700">
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-semibold text-green-700">{number}</span>
      <span className="text-gray-700 font-medium">{title}</span>
    </div>
  </div>
);



const ValuationCard = ({ proposalId, matchHeight }) => {
  const navigate = useNavigate();
  const [valuationData, setValuationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        console.log(`proposal id at fetch valuation ${proposalId}`)
        const response = await fetch(
          `${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`
        );
        const data = await response.json();
        if (data.status) {
          setValuationData(data.data);
        }
      } catch (err) {
        console.error("Error fetching valuation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchValuation();
  }, [proposalId]);

  const handleEditValuation = () => {
    navigate("/business-valuation", {
      state: {
        proposalId,
        shouldRefresh: true,
      },
    });
  };

  if (loading) {
    return (
      <div
        className="animate-pulse bg-white rounded-lg shadow p-4"
        style={{ height: matchHeight }}
      ></div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 relative"
      style={{ height: matchHeight }}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Business Type</p>
          <p className="font-medium">
            {valuationData?.businessType || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Valuation Type</p>
          <p className="font-medium">
            {valuationData?.valuationType || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Valuation</p>
          <p className="font-medium">
            {valuationData?.ebitdaValuation?.valuation ||
            valuationData?.dcfValuation?.valuation
              ? `₹ ${(
                  valuationData?.ebitdaValuation?.valuation ||
                  valuationData?.dcfValuation?.valuation
                ).toLocaleString()}`
              : "Not calculated"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Rating</p>
          <p className="font-medium">
            {valuationData?.ebitdaValuation?.rating ||
              valuationData?.dcfValuation?.rating ||
              "N/A"}
          </p>
        </div>

        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleEditValuation}
            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded transition-colors text-white "
          >
            Edit details
          </button>
        </div>
      </div>
    </div>
  );
};

const ProposalVersionCard = ({ proposal, version, proposalId, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [localVersion, setLocalVersion] = useState(version);

  const getInvestmentOffer = () => {
    if (localVersion.proposalType === "Equity Funding") {
      const fundingValue =
        localVersion.equityFundingDetails?.fundingReq?.value || "0";
      const ownershipNew = localVersion.equityFundingDetails?.newOwnership || "0";
      return `₹${fundingValue} for ${ownershipNew}% of Ownership`;
    } else if (localVersion.proposalType === "Partial") {
      const exitValue = localVersion.partialExitDetails?.exitValue || "0";
      const exitPercentage = localVersion.partialExitDetails?.plannedExit || "0";
      return `₹${exitValue} for ${exitPercentage}% Ownership`;
    } else if (localVersion.proposalType === "Full") {
      const exitValue = localVersion.fullExitDetails?.exitValue || "0";
      return `₹${exitValue} for Full Ownership`;
    }
    return "Investment details not available";
  };

  const handleHoldRequest = async (reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/request-hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          proposalNumber: proposal.proposalNumber,
          versionNumber: localVersion.versionNumber,
          reason
        }),
      });
  
      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to submit hold request');
      }
  
      // Update local state immediately
      setLocalVersion(prev => ({
        ...prev,
        status: 'requested',
        holdRequestReason: reason
      }));

      // Close the modal
      setShowHoldModal(false);
      
      // Notify parent component of the update
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(proposalId, proposal.proposalNumber, localVersion.versionNumber, 'requested');
      }

      toast.success('Hold request submitted successfully');
    } catch (error) {
      console.error('Error requesting hold:', error);
      toast.error(error.message || 'Failed to submit hold request');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-green-700">
            {`${proposal.proposalNumber}/${localVersion.versionNumber}`}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              localVersion.status === 'active' ? 'bg-green-100 text-green-800' :
              localVersion.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
              localVersion.status === 'requested' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {localVersion.status === 'requested' ? 'Hold Requested' :
               localVersion.status === 'hold' ? 'On Hold' :
               'Active'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(localVersion.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {localVersion.proposalName || "Unnamed Proposal"}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Revenue (Last FY):</span>
          <span className="font-medium">INR 0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">EBITDA (Last FY):</span>
          <span className="font-medium">INR 0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Interests Received:</span>
          <span className="font-medium">0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Investors Contacted:</span>
          <span className="font-medium">0</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {localVersion.status === 'active' && (
          <button
            onClick={() => setShowHoldModal(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors font-medium"
          >
            Request Hold
          </button>
        )}
        <button
          onClick={() => navigate("/pitchdeck", {
            state: {
              proposalId,
              proposalNumber: proposal.proposalNumber,
              versionNumber: localVersion.versionNumber,
            },
          })}
          className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded transition-colors text-white"
        >
          Edit proposal
          Edit proposal
        </button>
      </div>

      {showHoldModal && (
        <HoldRequestModal
          isOpen={showHoldModal}
          onClose={() => setShowHoldModal(false)}
          onSubmit={handleHoldRequest}
          proposalName={`${proposal.proposalNumber}/${localVersion.versionNumber}`}
        />
      )}
    </div>
  );
};

const InvestorProposalCard = ({ investor, connection, proposalId }) => {
  const navigate = useNavigate();

  const handleNavigateToCommonPage = () => {
    console.group('Navigation to CommonPage');
    console.log('proposalId:', proposalId);
    console.log('investor._id:', investor?._id);
    
    if (!proposalId || !investor?._id) {
      console.error('Missing required IDs:');
      console.error('proposalId:', proposalId);
      console.error('investor._id:', investor?._id);
      return;
    }
    
    console.log('Navigating with state:', {
      proposalId: proposalId,
      investorId: investor._id
    });
    console.groupEnd();
    
    navigate('/common-page', {
      state: {
        proposalId: proposalId,
        investorId: investor._id,
        source: 'business'
      }
    });
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-green-700 mb-2">{investor?.fullName || 'Unknown Investor'}</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-600">Company:</p>
            <p className="font-medium">{investor?.entity_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Designation:</p>
            <p className="font-medium">{investor?.entity_designation || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-sm text-gray-600">Connection Date:</p>
          <p className="font-medium">
            {new Date(connection?.paymentDetails?.timestamp).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status:</p>
          <p className="text-green-600 font-medium capitalize">{connection?.status}</p>
        </div>
      </div>

      <div className="flex gap-2">
      <button 
          onClick={handleNavigateToCommonPage}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Contact Investor
        </button>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetails } = useAuth();
  const [cardHeights, setCardHeights] = useState({});
  const [connectedInvestors, setConnectedInvestors] = useState([]);
  const [holdModal, setHoldModal] = useState({ isOpen: false, proposalId: null });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    proposalId: null,
    businessName: ''
  });

  const [selectedProposalId, setSelectedProposalId] = useState('');
  const dummyInvestorProposals = [
    {
      id: 1,
      investorName: "John Smith",
      credentials: "Angel Investor",
      lastContacted: "2024-03-15",
      lastConversation: "Initial interest expressed",
    },
    {
      id: 2,
      investorName: "Sarah Johnson",
      credentials: "VC Partner",
      lastContacted: "2024-03-14",
      lastConversation: "Due diligence in progress",
    },
    {
      id: 3,
      investorName: "Michael Chang",
      credentials: "PE Fund Manager",
      lastContacted: "2024-03-13",
      lastConversation: "Scheduling meeting",
    },
  ];

  useEffect(() => {
    if (userDetails?.userId) {
      fetchProposals();
    }
  }, [userDetails]);

  useEffect(() => {
    const updateCardHeights = () => {
      const heights = {};
      proposals.forEach((proposal) => {
        const card = document.getElementById(`proposal-${proposal._id}`);
        if (card) {
          heights[proposal._id] = card.offsetHeight;
        }
      });
      setCardHeights(heights);
    };

    if (proposals.length > 0) {
      setTimeout(updateCardHeights, 100);
    }
  }, [proposals]);

  // Replace the existing fetchConnections code with this:
  // Update the useEffect for fetching connections
  useEffect(() => {
    const fetchConnections = async (proposalId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-investor-connections/${proposalId}`);
        const data = await response.json();
        
        if (data.status && Array.isArray(data.data)) {
          console.log('Fetched connections for proposal:', proposalId, data.data);
          setConnectedInvestors(prevConnections => {
            const connectionsMap = new Map();
            
            // Add existing connections with null check
            prevConnections.forEach(connection => {
              if (connection?.investorId?._id) {
                connectionsMap.set(connection.investorId._id, connection);
              }
            });
            
            // Add new connections with null check
            data.data.forEach(connection => {
              if (connection?.investorId?._id) {
                connectionsMap.set(connection.investorId._id, connection);
              }
            });
            
            return Array.from(connectionsMap.values());
          });
        } else {
          console.error('Failed to fetch connections:', data.message);
        }
      } catch (error) {
        console.error('Error fetching connections for proposal:', proposalId, error);
      }
    };
  
    const fetchConnectionsForProposals = async () => {
      if (proposals.length > 0) {
        setConnectedInvestors([]); // Reset connections before fetching new ones
        for (const proposal of proposals) {
          if (proposal?._id) {
            await fetchConnections(proposal._id);
          }
        }
      }
    };
  
    fetchConnectionsForProposals();
  }, [proposals]);

  const openHoldModal = (proposalId) => {
    setHoldModal({ isOpen: true, proposalId });
  };

  const closeHoldModal = () => {
    setHoldModal({ isOpen: false, proposalId: null });
  };

  const fetchProposals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business-proposal/get-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userDetails.userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }

      const data = await response.json();
      if (data.status) {
        const sortedProposals = data.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setProposals(sortedProposals);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = () => {
    navigate("/business-proposalform");
  };

  const handleEditProposal = (proposalId) => {
    navigate("/business-proposalform", {
      state: { proposalId },
    });
  };

  if (!userDetails?.userId || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (!error && proposals.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <NewUserView onCreateProfile={() => navigate("/business-proposalform")} />
      </div>
    );
  }

  // In Home.jsx, add this function before the return statement
  const initiateDelete = (proposalId, businessName) => {
    setDeleteConfirmation({
      isOpen: true,
      proposalId,
      businessName
    });
  };
  
  const handleDeleteProposal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId: deleteConfirmation.proposalId }),
      });
  
      const data = await response.json();
      if (data.status) {
        setProposals(proposals.filter(proposal => proposal._id !== deleteConfirmation.proposalId));
        setDeleteConfirmation({ isOpen: false, proposalId: null, businessName: '' });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error deleting proposal:', err);
      alert('Failed to delete proposal. Please try again.');
    }
  };

  const handleRequestHold = async (proposalId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/request-hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId, reason }),
      });
  
      const data = await response.json();
      if (data.status) {
        setProposals(prevProposals =>
          prevProposals.map(proposal =>
            proposal._id === proposalId
              ? { ...proposal, status: 'requested', holdRequestReason: reason }
              : proposal
          )
        );
      } else {
        throw new Error(data.message || 'Failed to submit hold request');
      }
    } catch (error) {
      console.error('Error requesting hold:', error);
      alert(error.message || 'Failed to submit hold request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 pt-8 pb-4 max-w-[1400px]">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>
  
        <div className="flex justify-center mb-10">
          <div className="flex gap-6">
            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#227c45]">
                {proposals.reduce((count, proposal) => {
                  return (
                    count +
                    (proposal.proposals?.reduce(
                      (versionCount, p) =>
                        versionCount + (p.versions?.length || 0),
                      0
                    ) || 0)
                  );
                }, 0)}
              </div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Live Proposals
              </div>
            </div>
  
            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#a53d6e]">0</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Investors Interests
              </div>
            </div>
  
            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#8b5cf6]">0</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Investors Contacted
              </div>
            </div>
          </div>
        </div>
  
        <div className="bg-[#f5f5f5] rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Column 1: Business Proposals */}
            {/* Column 1: Business Proposals */}
<BusinessProposalsColumn
  loading={loading}
  error={error}
  proposals={proposals}
  handleCreateProposal={handleCreateProposal}
  handleEditProposal={handleEditProposal}
  openHoldModal={openHoldModal}
  initiateDelete={initiateDelete}
  setProposals={setProposals}
/>
  
            {/* Column 2: Valuation Cards */}
            <div>
              <StepHeader number="2" title="My Business Valuation" />
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <ValuationCard 
                    key={proposal._id} 
                    proposalId={proposal._id}
                    matchHeight={cardHeights[proposal._id]}
                  />
                ))}
              </div>
            </div>
  
            {/* Column 3: Proposal Versions */}
            <div>
              <StepHeader number="3" title="My Proposals" />
              <div className="space-y-6">
                {proposals.map((proposal) => {
                  const hasProposals = proposal.proposals && 
                    proposal.proposals.length > 0 && 
                    proposal.proposals.some(p => p.versions && p.versions.length > 0);
                  
                  if (!hasProposals) {
                    return (
                      <div key={proposal._id} className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">No Proposals Yet</h3>
                        <p className="text-gray-600 mb-6">Create your first proposal to start connecting with investors</p>
                        <button
                          onClick={() => navigate('/create-proposal', {
                            state: {
                              proposalId: proposal._id,
                              businessType: proposal.businessType,
                              valuationType: proposal.valuationType,
                              valuation: proposal.ebitdaValuation?.valuation || proposal.dcfValuation?.valuation,
                              rating: proposal.ebitdaValuation?.rating || proposal.dcfValuation?.rating
                            }
                          })}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Create Proposal
                        </button>
                      </div>
                    );
                  }
  
                  return (
                    <div key={proposal._id} className="space-y-6">
                      {(proposal.proposals || []).map((proposalVersion) => (
                        (proposalVersion.versions || []).map((version) => (
                          <ProposalVersionCard
  key={`${proposalVersion.proposalNumber}-${version.versionNumber}`}
  proposal={proposalVersion}
  version={version}
  proposalId={proposal._id}
  onStatusUpdate={(proposalId, proposalNumber, versionNumber, newStatus) => {
    setProposals(prevProposals => 
      prevProposals.map(proposal => 
        proposal._id === proposalId 
          ? {
              ...proposal,
              proposals: proposal.proposals.map(p => 
                p.proposalNumber === proposalNumber
                  ? {
                      ...p,
                      versions: p.versions.map(v =>
                        v.versionNumber === versionNumber
                          ? { ...v, status: newStatus }
                          : v
                      )
                    }
                  : p
              )
            }
          : proposal
      )
    );
  }}
/>
                        ))
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
  
             {/* Column 4: Investor Proposals */}
             {/* Column 4: Investor Proposals */}
              
            {/* Column 4: Investor Proposals */}
{/* Column 4: Investor Proposals */}
<div>
  <StepHeader number="4" title="My Investor Connects" />
  
  {/* Find Investors Container */}
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div className="text-center mb-4">
      <h3 className="text-xl font-semibold text-gray-800">Find More Investors</h3>
      <p className="text-gray-600 mt-2 mb-4">
        Discover and connect with investors that match your business needs
      </p>
      <button
        onClick={() => {
          // Get the proposal ID from Column 1
          const proposalId = proposals[0]?._id;
          console.log('Proposal ID being sent:', proposalId);
          
          if (proposalId) {
            navigate('/find-investors', {
              state: { 
                proposalId: proposalId,
                businessName: proposals[0].businessLegalName 
              }
            });
          }
        }}
        className="w-full md:w-auto bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors font-medium"
      >
        Find Investors
      </button>
    </div>
  </div>

      {/* Existing InvestorConnects component */}
      <div className="mb-6">
        {proposals.map((proposal) => (
          <InvestorConnects key={proposal._id} proposalId={proposal._id} />
        ))}
      </div>

      {/* Existing connected investors */}
      <div className="space-y-6">
        {connectedInvestors
          .filter(connection => connection?.investorId?._id)
          .map((connection) => (
            <div key={`connected-${connection.investorId._id}`}>
              {proposals.map((proposal) => (
                <InvestorProposalCard 
                  key={`${connection.investorId._id}-${proposal._id}`}
                  connection={connection}
                  proposalId={proposal._id}
                  investor={connection.investorId}
                />
              ))}
            </div>
          ))}
      </div>

      {/* New transaction-based investors */}
      <div className="space-y-6 mt-6">
        {proposals.map((proposal) => (
          <TransactionBasedInvestors 
            key={`transaction-${proposal._id}`} 
            proposalId={proposal._id} 
          />
        ))}
      </div>
    </div>
            </div>
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        <HoldRequestModal
  isOpen={holdModal.isOpen}
  onClose={closeHoldModal}
  onSubmit={(reason) => {
    handleRequestHold(holdModal.proposalId, reason);
    closeHoldModal();
  }}
  proposalName={proposals.find(p => p._id === holdModal.proposalId)?.businessLegalName}
/>
{deleteConfirmation.isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Delete Business Profile
      </h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this business profile? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteConfirmation({ isOpen: false, proposalId: null, businessName: '' })}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteProposal}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    );
  };
  
  export default Home;
