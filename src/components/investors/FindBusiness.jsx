import React, { useState, useEffect } from "react";
import NavbarInvestor from "../../components/pages/NavbarInvestor";
import { Building2, DollarSign, Scale, BarChart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
const BusinessCard = ({ business }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const investorId = location.state?.investorId;
  const handleContactClick = () => {
    if (!investorId) {
      toast.error("Please complete your investor profile first");
      navigate("/investor-home");
      return;
    }
    navigate(`/contact-business/${business._id}`, {
      state: { investorId },
    });
  };
  const formatCurrency = (value) => {
    if (!value) return "Not Available";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInvestmentDetails = () => {
    if (business.dcfValuation?.valuation) {
      return {
        valuation: business.dcfValuation.valuation,
        rating: business.dcfValuation.rating,
      };
    } else if (business.ebitdaValuation?.valuation) {
      return {
        valuation: business.ebitdaValuation.valuation,
        rating: business.ebitdaValuation.rating,
      };
    }
    return { valuation: "Not Available", rating: "N/A" };
  };

  const { valuation, rating } = getInvestmentDetails();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">
            {business.businessLegalName || "Unnamed Business"}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {business.shortBusinessDesc || "No description available"}
          </p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            <span className="font-medium">Products/Services:</span>{" "}
            {business.keyProducts || "Not specified"}
          </p>
        </div>
        {rating !== "N/A" && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center">
            <Star className="w-4 h-4 mr-1" />
            {rating}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Building2 className="w-5 h-5 text-gray-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Total Assets</p>
            <p className="font-medium">
              {formatCurrency(business.totalAssets)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Scale className="w-5 h-5 text-gray-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Total Liabilities</p>
            <p className="font-medium">
              {formatCurrency(business.totalLiabilities)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
        <div>
          <p className="text-sm text-gray-500">Business Valuation</p>
          <p className="font-medium">{formatCurrency(valuation)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContactClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Contact Business
        </button>
      </div>
    </div>
  );
};

const FindBusiness = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const investorId = location.state?.investorId;

  useEffect(() => {
    if (investorId) {
      console.log("Current Investor ID:", investorId);
      fetchBusinesses();
    }
  }, [investorId]);

  const checkTransaction = async (proposalId, investorId) => {
    try {
      console.log(`Checking transaction for proposal ${proposalId} and investor ${investorId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/transactions/get-by-proposal-investor/${proposalId}/${investorId}`
      );
      
      if (!response.ok) {
        console.log(`No transaction found for proposal ${proposalId}`);
        return false;
      }
  
      const responseData = await response.json();
      console.log('Transaction response:', responseData);
  
      // Check if we have a valid transaction in the data field
      if (!responseData.status || !responseData.data) {
        console.log(`No valid transaction data for proposal ${proposalId}`);
        return false;
      }
  
      // Handle the nested data object
      const transactionData = responseData.data;
      const hasAcceptedTerms = transactionData.terms_of_investor === true;
      console.log(`Proposal ${proposalId} has accepted terms: ${hasAcceptedTerms}`);
      return hasAcceptedTerms;
  
    } catch (err) {
      console.error("Error checking transaction:", err);
      return false;
    }
  };
  
  // The fetchBusinesses function using the updated checkTransaction
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/business-proposal/get-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }
  
      const data = await response.json();
  
      if (data.status) {
        console.log("Total businesses fetched:", data.data.length);
  
        // First filter out already connected businesses
        let filteredBusinesses = data.data.filter((business) => {
          if (!business.investorConnections || !Array.isArray(business.investorConnections)) {
            return true;
          }
  
          return !business.investorConnections.some(
            (connection) => {
              const connectionInvestorId = connection.investorId?.$oid || connection.investorId;
              return connectionInvestorId === investorId && connection.status === "connected";
            }
          );
        });
  
        console.log("Businesses after connection filtering:", filteredBusinesses.length);
  
        // Check transactions for remaining businesses
        const results = await Promise.all(
          filteredBusinesses.map(async (business) => {
            console.log('Checking business:', business._id);
            const hasAcceptedTerms = await checkTransaction(business._id, investorId);
            console.log(`Business ${business._id} accepted terms: ${hasAcceptedTerms}`);
            return {
              business,
              hasAcceptedTerms
            };
          })
        );
  
        // Filter out businesses with accepted terms
        filteredBusinesses = results
          .filter(result => !result.hasAcceptedTerms)
          .map(result => result.business);
  
        console.log("Final businesses after transaction filtering:", filteredBusinesses.length);
  
        // Sort remaining businesses by creation date
        const sortedBusinesses = filteredBusinesses.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
  
        setBusinesses(sortedBusinesses);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarInvestor />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">
          Business for Sale and Investment Opportunities
        </h1>
        <p className="text-gray-600 mb-8">
          Choose your preferred investment opportunity.
        </p>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search businesses by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const filteredBusinesses = businesses.filter((business) =>
              business.businessLegalName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
            );

            return filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => (
                <BusinessCard 
                  key={business._id} 
                  business={business}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No businesses match your search."
                    : "No businesses available at the moment."}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default FindBusiness;
