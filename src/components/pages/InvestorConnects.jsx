// import React, { useState, useEffect } from 'react';
// import { Eye } from 'lucide-react';

// const InvestorConnects = ({ proposalId }) => {
//   const [investors, setInvestors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

//   useEffect(() => {
//     const fetchInvestorData = async () => {
//       try {
//         // First fetch transactions for the proposal
//         const transResponse = await fetch(`${API_BASE_URL}/api/transactions/get-proposal/${proposalId}`);
//         const transData = await transResponse.json();
        
//         if (!transData.status) {
//           throw new Error(transData.message);
//         }

//         // For each transaction, fetch the investor details
//         const investorPromises = transData.data.map(async (transaction) => {
//           const investorId = transaction.investor._id;
//           const investorResponse = await fetch(`${API_BASE_URL}/api/investor/get-investor/${investorId}`);
//           const investorData = await investorResponse.json();
          
//           return {
//             ...investorData.data,
//             contactInfo: transaction.contact_business_info,
//             contactDate: new Date(transaction.createdAt).toLocaleDateString()
//           };
//         });

//         const investorResults = await Promise.all(investorPromises);
//         setInvestors(investorResults);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (proposalId) {
//       fetchInvestorData();
//     }
//   }, [proposalId]);

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2].map((i) => (
//           <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//         {error}
//       </div>
//     );
//   }

//   if (investors.length === 0) {
//     return (
//       <div className="bg-white rounded-lg p-6 text-center">
//         <p className="text-gray-600">No investor connects yet</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {investors.map((investor, index) => (
//         <div key={index} className="bg-white rounded-lg shadow-lg p-6">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <h3 className="text-lg font-medium text-green-700">{investor.fullName}</h3>
//               <p className="text-sm text-gray-600">{investor.designation} at {investor.companyName}</p>
//             </div>
//             <button
//               onClick={() => window.location.href = `/investor-profile/${investor._id}`}
//               className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
//             >
//               <Eye className="w-4 h-4" />
//               <span>View</span>
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             <p className="text-sm text-gray-600">
//               <strong>Contact Date:</strong> {investor.contactDate}
//             </p>
//             <p className="text-sm text-gray-600">
//               <strong>Message:</strong> {investor.contactInfo}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default InvestorConnects;


// import React, { useState, useEffect } from 'react';
// import { Eye } from 'lucide-react';

// const InvestorConnects = ({ proposalId }) => {
//   const [investors, setInvestors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

//   useEffect(() => {
//     const fetchInvestorData = async () => {
//       try {
//         // Fetch transactions
//         const transResponse = await fetch(`${API_BASE_URL}/api/transactions/get-proposal/${proposalId}`);
//         if (!transResponse.ok) {
//           throw new Error(`Failed to fetch transactions`);
//         }
        
//         const transData = await transResponse.json();
//         console.log('Transaction data:', transData);
        
//         if (!transData.status || !transData.data) {
//           throw new Error('No transaction data available');
//         }

//         // Only process transactions with valid investor IDs
//         const validTransactions = transData.data.filter(transaction => 
//           transaction?.investor?._id
//         );

//         // Fetch investor details for each valid transaction
//         const investorPromises = validTransactions.map(async (transaction) => {
//           // Using the correct API endpoint
//           const investorResponse = await fetch(`${API_BASE_URL}/api/investor/get-investor/${transaction.investor._id}`);
          
//           if (!investorResponse.ok) {
//             console.error(`Failed to fetch investor ${transaction.investor._id}`);
//             return null;
//           }

//           const investorData = await investorResponse.json();
          
//           if (!investorData?.data?.fullName) {
//             console.error(`Invalid investor data for ${transaction.investor._id}`);
//             return null;
//           }

//           return {
//             ...investorData.data,
//             contactInfo: transaction.contact_business_info,
//             contactDate: new Date(transaction.createdAt).toLocaleDateString()
//           };
//         });

//         const investorResults = await Promise.all(investorPromises);
//         // Only keep investors with complete data
//         const completeInvestors = investorResults.filter(investor => investor !== null);
//         setInvestors(completeInvestors);
        
//       } catch (err) {
//         console.error('Error fetching investor data:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (proposalId) {
//       fetchInvestorData();
//     }
//   }, [proposalId]);

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2].map((i) => (
//           <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//         Error loading investor connects: {error}
//       </div>
//     );
//   }

//   if (!investors || investors.length === 0) {
//     return ;
//   }

//   return (
//     <div className="mt-6 space-y-6">
//       {(!investors || investors.length === 0) && (
//         <div className="bg-white rounded-lg shadow-lg p-6 text-center mb-6">
//           <h3 className="text-lg font-medium text-gray-800 mb-4">No Connected Investors</h3>
//           <p className="text-gray-600 mb-6">
//             Start connecting with investors to see them here
//           </p>
//           <button
//             onClick={() => navigate('/find-investors')}
//             className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
//           >
//             Find Investors
//           </button>
//         </div>
//       )}
      
//       {investors && investors.length > 0 && (
//         <div className="space-y-4 mt-6">
//           {investors.map((investor, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-medium text-green-700">{investor.fullName}</h3>
//                 </div>
//                 <button
//                   onClick={() => window.location.href = `/investor-profile/${investor._id}`}
//                   className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
//                 >
//                   <Eye className="w-4 h-4" />
//                   <span>View</span>
//                 </button>
//               </div>
              
//               <div className="space-y-2">
//                 <p className="text-sm text-gray-600">
//                   <strong>Contact Date:</strong> {investor.contactDate}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   <strong>Message:</strong> {investor.contactInfo}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default InvestorConnects;
// InvestorConnects.jsx
import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvestorConnects = ({ proposalId }) => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        const transResponse = await fetch(`${API_BASE_URL}/api/transactions/get-proposal/${proposalId}`);
        if (!transResponse.ok) {
          throw new Error(`Failed to fetch transactions`);
        }
        
        const transData = await transResponse.json();
        
        if (!transData.status || !transData.data) {
          throw new Error('No transaction data available');
        }

        const validTransactions = transData.data.filter(transaction => 
          transaction?.investor?._id && transaction.accept_or_reject === null
        );

        const investorPromises = validTransactions.map(async (transaction) => {
          const investorResponse = await fetch(`${API_BASE_URL}/api/investor/get-investor/${transaction.investor._id}`);
          
          if (!investorResponse.ok) {
            console.error(`Failed to fetch investor ${transaction.investor._id}`);
            return null;
          }

          const investorData = await investorResponse.json();
          
          if (!investorData?.data?.fullName) {
            console.error(`Invalid investor data for ${transaction.investor._id}`);
            return null;
          }

          return {
            ...investorData.data,
            contactInfo: transaction.contact_business_info,
            contactDate: new Date(transaction.createdAt).toLocaleDateString()
          };
        });

        const investorResults = await Promise.all(investorPromises);
        const completeInvestors = investorResults.filter(investor => investor !== null);
        setInvestors(completeInvestors);
        
      } catch (err) {
        console.error('Error fetching investor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchInvestorData();
    }
  }, [proposalId]);

  const handleViewInvestor = (investorId) => {
    navigate(`/investor-profile/${investorId}`, {
      state: { proposalId: proposalId }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading investor connects: {error}
      </div>
    );
  }

  if (!investors || investors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Investor Requests</h3>
      <div className="space-y-3">
        {investors.map((investor, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{index + 1}.</span>
              <span className="font-medium">{investor.fullName}</span>
            </div>
            <button
              onClick={() => handleViewInvestor(investor._id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestorConnects;