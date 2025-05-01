import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TransactionBasedInvestors = ({ proposalId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/transactions/get-proposal/${proposalId}`
        );
        const data = await response.json();
        
        if (!data.status) {
          setError(data.message || 'Failed to fetch transactions');
          return;
        }

        // Handle the case where data.data might be a single object
        const transactionData = data.data;
        if (!transactionData) {
          setTransactions([]);
          return;
        }

        // Convert to array if single object
        const transactionsArray = Array.isArray(transactionData) 
          ? transactionData 
          : [transactionData];

        // Filter out transactions with null investor and accept_or_reject === 'accept'
        const acceptedTransactions = transactionsArray.filter(
          transaction => transaction && 
                        transaction.investor && 
                        transaction.accept_or_reject === 'accept'
        );

        // Fetch investor details for each transaction
        const transactionsWithInvestors = await Promise.all(
          acceptedTransactions.map(async (transaction) => {
            try {
              // Safely get investor ID whether it's an object or string
              const investorId = transaction.investor?._id || transaction.investor;
              
              if (!investorId) {
                console.warn('No investor ID found for transaction:', transaction);
                return transaction;
              }

              const investorResponse = await fetch(
                `${API_BASE_URL}/api/investor/get-investor/${investorId}`
              );
              
              if (!investorResponse.ok) {
                throw new Error(`HTTP error! status: ${investorResponse.status}`);
              }
              
              const investorData = await investorResponse.json();
              
              if (investorData.status && investorData.data) {
                return {
                  ...transaction,
                  investor: investorData.data
                };
              }
              
              return transaction;
            } catch (error) {
              console.error(`Error fetching investor details:`, error);
              return transaction;
            }
          })
        );

        // Filter out any transactions that still have null investors after fetching
        const validTransactions = transactionsWithInvestors.filter(
          transaction => transaction && transaction.investor
        );

        setTransactions(validTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchTransactions();
    }
  }, [proposalId]);

  const handleNavigateToCommonPage = (transaction) => {
    // Safely get investor ID
    const investorId = transaction?.investor?._id || transaction?.investor;

    if (!proposalId || !investorId) {
      console.error('Missing required IDs', { proposalId, investorId });
      return;
    }
    
    navigate('/common-page', {
      state: {
        proposalId: proposalId,
        investorId: investorId,
      }
    });
  };

  // Rest of the component remains the same...
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {transactions.map((transaction) => (
        <div key={transaction._id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-green-700 mb-2">
              {transaction.investor?.fullName || 'Unknown Investor'}
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Company:</p>
                <p className="font-medium">{transaction.investor?.entity_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation:</p>
                <p className="font-medium">{transaction.investor?.entity_designation || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <p className="text-sm text-gray-600">Connection Date:</p>
              <p className="font-medium">
                {transaction.investor?.updatedAt ? new Date(transaction.investor.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status:</p>
              <p className="text-green-600 font-medium capitalize">
                {'Connected'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleNavigateToCommonPage(transaction)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Contact Investor
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionBasedInvestors;