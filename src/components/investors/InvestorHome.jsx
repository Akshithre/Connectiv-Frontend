import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Globe, Linkedin, Trash2 } from "lucide-react";
import NavbarInvestor from "../../components/pages/NavbarInvestor";
import { useAuth } from "../../contexts/authContext";
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const NewInvestorView = ({ onCreateProfile }) => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-3 flex justify-center gap-16">
        <div className="w-[35%] p-12 bg-white border-2 border-green-800 rounded-lg my-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Investors</h2>
          <p className="mb-8 text-gray-600">
            Join our Portal Investment Hub to discover promising investment opportunities.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">1</div>
              <div>
                <p className="font-medium">Create Investor Profile</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">2</div>
              <div>
                <p className="font-medium">Contact with Businesses</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">3</div>
              <div>
                <p className="font-medium">Perform Due Diligence</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-white font-bold">4</div>
              <div>
                <p className="font-medium">Negotiate and Close</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[25%] p-11 bg-gray-50 mx-9 my-14 rounded-lg">
          <div className="w-[220px] h-[160px] flex flex-col">
            <h2 className="text-xl font-bold mb-3">
              List your investments on Hubridge M&A
            </h2>
            <p className="text-gray-600 mb-3 text-md leading-relaxed">
              Access equity opportunities in profit-making private businesses across industries.
            </p>
            <button
              onClick={onCreateProfile}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-9"
            >
              Create Investor Profile
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

const InvestorProfileCard = ({ investor, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 relative">
    <button
      onClick={() => onDelete(investor._id)}
      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete investor profile"
    >
      <Trash2 className="w-5 h-5" />
    </button>

    <div className="space-y-4">
      <div>
        <div className="text-sm text-gray-600">Name:</div>
        <p className="font-medium">{investor.fullName}</p>
      </div>

      <div>
        <div className="text-sm text-gray-600">Location:</div>
        <p className="font-medium">{investor.Location ? investor.Location.join(', ') : 'Chennai'}</p>
      </div>

      <div>
        <div className="text-sm text-gray-600">Short Description:</div>
        <p className="font-medium">{investor.prof_desc}</p>
      </div>

      <div>
        <div className="text-sm text-gray-600">Industries Interested:</div>
        <p className="font-medium">{investor.interested_industries?.join(', ')}</p>
      </div>

      <div>
        <div className="text-sm text-gray-600">Target Investment Size:</div>
        <p className="font-medium">Range ₹{investor.investment_size_pref_min} - ₹{investor.investment_size_pref_max}</p>
      </div>

      <div>
        <div className="text-sm text-gray-600">Deals in last 3Y:</div>
        <p className="font-medium">{investor.no_deals}</p>
      </div>

      <div className="pb-16">
        <div className="text-sm text-gray-600">Highest Deal Size:</div>
        <p className="font-medium">INR {investor.investment_size_his_max}</p>
      </div>
    </div>

    <div className="absolute bottom-6 left-6 right-6 flex justify-end">
      <button
        onClick={() => onEdit(investor._id)}
        className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded transition-colors text-white"
      >
        Edit Investor Profile
      </button>
    </div>
  </div>
);

const BusinessConnectCard = ({ business, onStatusChange }) => {
  const navigate = useNavigate();
  const { userDetails } = useAuth();
  const [investors, setInvestors] = useState([]);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/investor/get-all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userDetails.userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch investors");
        }

        const data = await response.json();
        if (data.status) {
          setInvestors(data.data);
        }
      } catch (err) {
        console.error("Error fetching investors:", err);
      }
    };

    if (userDetails?.userId) {
      fetchInvestors();
    }
  }, [userDetails]);

  const handleViewDetails = () => {
    if (!investors || investors.length === 0) {
      console.error('No investor profile found');
      return;
    }

    navigate('/common-page', {
      state: {
        proposalId: business._id,
        investorId: investors[0]._id,
        source: 'investor'
      }
    });
  };

  const getStatusDisplayName = (status) => {
    switch(status) {
      case "due-diligence":
        return "Due Diligence";
      case "negotiated":
        return "Negotiated & Closed";
      default:
        return "Active Business";
    }
  };

  const handleStatusChangeClick = (newStatus) => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  const handleConfirmStatusChange = () => {
    onStatusChange(business._id, pendingStatus);
    setShowStatusConfirm(false);
    toast.success('Status updated successfully');
  };

  const handleCancelStatusChange = () => {
    setShowStatusConfirm(false);
  };

  const getLatestFinancials = () => {
    if (!business.ebitdaValuation) return { year: null, revenue: null, ebitda: null };

    const years = Object.keys(business.ebitdaValuation.revenue || {})
      .map(Number)
      .filter(year => !isNaN(year));

    if (years.length === 0) return { year: null, revenue: null, ebitda: null };

    const latestYear = Math.max(...years);
    return {
      year: latestYear,
      revenue: business.ebitdaValuation.revenue[latestYear],
      ebitda: business.ebitdaValuation.ebitda[latestYear]
    };
  };

  const getInvestmentOffer = () => {
    if (!business.proposals || business.proposals.length === 0) return 'N/A';
    
    const latestProposal = business.proposals[0];
    if (!latestProposal.versions || latestProposal.versions.length === 0) return 'N/A';
    
    const latestVersion = latestProposal.versions[0];
    return latestVersion.investment_offer || 'N/A';
  };

  const { year, revenue, ebitda } = getLatestFinancials();
  
  const formattedDate = business.transactionDate 
    ? new Date(business.transactionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : new Date(business.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Add dropdown at top right */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {business.businessLegalName || 'Unnamed Business'}
        </h3>
        <select
          className="ml-4 px-3 py-1 border rounded-md text-sm text-gray-700"
          value={business.filter || ''}
          onChange={(e) => handleStatusChangeClick(e.target.value)}
        >
          <option value="">Active Business</option>
          <option value="due-diligence">Due Diligence</option>
          <option value="negotiated">Negotiated & Closed</option>
        </select>
      </div>

      {/* Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Business Status
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you wish to change the state to "{getStatusDisplayName(pendingStatus)}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelStatusChange}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}    
      
      {/* Header */}
      <p className="text-gray-500 mt-2">
        Last Updated on: {formattedDate}
      </p>

      {/* Description */}
      <div className="text-gray-700 mb-6">
        {business.shortBusinessDesc || 'No description available'}
      </div>

      {/* Details with consistent layout */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[140px_1fr] items-baseline">
          <span className="text-gray-600">Investment:</span>
          <span className="text-gray-900">{getInvestmentOffer()}</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] items-baseline">
          <span className="text-gray-600">Revenue (Last FY):</span>
          <span className="text-gray-900">
            INR {revenue ? Number(revenue).toLocaleString() : 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-[140px_1fr] items-baseline">
          <span className="text-gray-600">EBITDA (Last FY):</span>
          <span className="text-gray-900">
            INR {ebitda ? Number(ebitda).toLocaleString() : 'N/A'}
          </span>
        </div>

        <div className="flex gap-12">
          <div className="flex gap-2">
            <span className="text-gray-600">Interests Received:</span>
            <span className="text-gray-900">{business.interests_received || 0}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-600">Investors Contacted:</span>
            <span className="text-gray-900">{business.investors_contacted || 0}</span>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <div className="flex justify-end">
        <button
          onClick={handleViewDetails}
          className="bg-green-700 hover:bg-green-600 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Contact Business
        </button>
      </div>
    </div>
  );
};

const InvestorHome = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetails } = useAuth();
  const [connectedBusinesses, setConnectedBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState({
    inProgress: [],
    dueDiligence: [],
    negotiated: []
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    investorId: null,
    fullName: "",
  });

  useEffect(() => {
    if (userDetails?.userId) {
      fetchInvestors();
    }
  }, [userDetails]);

  // Updated useEffect to categorize businesses whenever connectedBusinesses changes
  useEffect(() => {
    if (connectedBusinesses.length > 0) {
      const categorizedBusinesses = {
        inProgress: connectedBusinesses.filter(b => !b.filter),
        dueDiligence: connectedBusinesses.filter(b => b.filter === 'due-diligence'),
        negotiated: connectedBusinesses.filter(b => b.filter === 'negotiated')
      };
      setFilteredBusinesses(categorizedBusinesses);
    }
  }, [connectedBusinesses]);

  const fetchInvestors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/get-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userDetails.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch investors");
      }

      const data = await response.json();
      if (data.status) {
        const sortedInvestors = data.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setInvestors(sortedInvestors);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching investors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    navigate("/investor-profile");
  };

  const handleEditProfile = (investorId) => {
    navigate("/investor-profile", {
      state: { investorId },
    });
  };

  const initiateDelete = (investorId, fullName) => {
    setDeleteConfirmation({
      isOpen: true,
      investorId,
      fullName
    });
  };

  const fetchBusinessDetails = async (proposalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`);
      if (!response.ok) throw new Error('Failed to fetch business details');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching business details:', error);
      return null;
    }
  };

  const fetchTransactionBusinesses = async (investorId) => {
    try {
      // First, fetch all transactions for the investor
      const response = await fetch(`${API_BASE_URL}/api/transactions/get-investor_proposal/${investorId}`);
      if (!response.ok) throw new Error('Failed to fetch transaction details');
      const data = await response.json();

      // Filter transactions where accept_or_reject is "accept"
      const acceptedTransactions = data.data.filter(transaction =>
        transaction.accept_or_reject === 'accept'
      );

      // For each accepted transaction, fetch the business proposal details
      const businessDetailsPromises = acceptedTransactions.map(async (transaction) => {
        try {
          // Ensure we're using the correct proposal ID string
          const proposalId = transaction.proposal._id || transaction.proposal;

          const proposalResponse = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`);
          if (!proposalResponse.ok) {
            console.error(`Failed to fetch proposal ${proposalId}`);
            return null;
          }

          const proposalData = await proposalResponse.json();

          if (!proposalData.data) {
            console.error(`No data returned for proposal ${proposalId}`);
            return null;
          }

          // Include transaction information with the business data
          return {
            ...proposalData.data,
            transactionId: transaction._id,
            transactionDate: transaction.createdAt
          };
        } catch (error) {
          console.error(`Error fetching proposal details:`, error);
          return null;
        }
      });
      // Wait for all proposal details to be fetched
      const businessDetails = await Promise.all(businessDetailsPromises);

      // Filter out any failed fetches (null values) and return the valid business details
      return businessDetails.filter(business => business !== null);
    } catch (error) {
      console.error('Error fetching transaction businesses:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllBusinessDetails = async () => {
      if (!investors.length) return;

      setLoading(true);
      try {
        // Fetch transaction businesses for each investor
        const transactionResults = await Promise.all(
          investors.map(investor => fetchTransactionBusinesses(investor._id))
        );

        // Fetch owner-connected businesses
        const ownerConnectedResults = await Promise.all(
          investors.flatMap(investor =>
            (investor.payment_done_from_owner || [])
              .filter(payment => payment.payment_done_from_owner_status)
              .map(payment => fetchBusinessDetails(payment.proposalId))
          )
        );

        // Combine the owner-connected and transaction-connected businesses
        const allBusinesses = [
          ...ownerConnectedResults.filter(business => business !== null),
          ...transactionResults.flat().filter(business => business !== null)
        ];
        
        // Set the combined business data
        setConnectedBusinesses(allBusinesses);
      } catch (error) {
        console.error('Error fetching business details:', error);
        setError('Failed to load business connections');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBusinessDetails();
  }, [investors]);

  const handleDeleteProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investor/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId: deleteConfirmation.investorId }),
      });

      const data = await response.json();
      if (data.status) {
        setInvestors(
          investors.filter(
            (investor) => investor._id !== deleteConfirmation.investorId
          )
        );
        setDeleteConfirmation({
          isOpen: false,
          investorId: null,
          fullName: "",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error deleting investor:", err);
      alert("Failed to delete investor profile. Please try again.");
    }
  };

  const handleFindBusiness = () => {
    if (investors.length === 0) {
      toast.error("Please complete your investor profile first");
      return;
    }
    const investorId = investors[0]._id;
    navigate("/find-business", {
      state: { investorId },
    });
  };

  // Updated handleStatusChange to update the business in connectedBusinesses array
  const handleStatusChange = async (businessId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: businessId,
          filter: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      if (data.status) {
        // Update the local state with the new status
        const updatedBusinesses = connectedBusinesses.map(business => 
          business._id === businessId 
            ? { ...business, filter: newStatus }
            : business
        );
        
        // This will trigger the useEffect that updates filteredBusinesses
        setConnectedBusinesses(updatedBusinesses);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (!userDetails?.userId || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarInvestor />
        <LoadingSpinner />
      </div>
    );
  }

  if (!error && investors.length === 0) {
    return (
      <div className="min-h-screen">
        <NavbarInvestor />
        <NewInvestorView onCreateProfile={handleCreateProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarInvestor />
      <div className="container mx-auto px-6 pt-8 pb-4 max-w-[1400px]">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Investor Dashboard
        </h1>

        <div className="flex justify-center mb-10">
          <div className="flex gap-6">
            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#227c45]">{connectedBusinesses.length}</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                All Business Connects
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#a53d6e]">{filteredBusinesses.inProgress.length}</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Active Businesses
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#5456e4]">{filteredBusinesses.dueDiligence.length}</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Under Evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md px-8 py-4 min-w-[240px] text-center transform transition-all hover:shadow-lg">
              <div className="text-4xl font-bold text-[#2799b0]">{filteredBusinesses.negotiated.length}</div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Closed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f5f5f5] rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="relative">
              <StepHeader number="1" title="My Investor Profile" />
              <div className="space-y-6">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="bg-white rounded-lg h-64"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                  </div>
                ) : (
                  investors.map((investor) => (
                    <InvestorProfileCard
                      key={investor._id}
                      investor={investor}
                      onEdit={handleEditProfile}
                      onDelete={() =>
                        initiateDelete(investor._id, investor.fullName)
                      }
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <StepHeader number="2" title="My Business Connects" />
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-600">Loading business connections...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Find Business Card - Always at the top */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 mb-4">
                      Find and connect with businesses that match your investment criteria
                    </p>
                    <button
                      onClick={handleFindBusiness}
                      className="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Find your Business
                    </button>
                  </div>

                  {/* Only show active businesses (no filter) in this column */}
                  {filteredBusinesses.inProgress.map((business) => (
                    <BusinessConnectCard
                      key={business._id || business.transactionId}
                      business={business}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <StepHeader number="3" title="Perform Due Diligence" />
              <div className="space-y-4">
                {/* Only show businesses with due-diligence filter in this column */}
                {filteredBusinesses.dueDiligence.map((business) => (
                  <BusinessConnectCard
                    key={business._id || business.transactionId}
                    business={business}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>

            <div>
              <StepHeader number="4" title="Negotiate and Close" />
              <div className="space-y-4">
                {/* Only show businesses with negotiated filter in this column */}
                {filteredBusinesses.negotiated.map((business) => (
                  <BusinessConnectCard
                    key={business._id || business.transactionId}
                    business={business}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>


        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Investor Profile
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this investor profile? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() =>
                    setDeleteConfirmation({
                      isOpen: false,
                      investorId: null,
                      fullName: "",
                    })
                  }
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorHome;
