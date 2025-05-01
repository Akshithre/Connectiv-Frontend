// PaymentPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RazorpayPayment from '../RazorPay';
import Navbar from '../../components/pages/Navbar';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { investorData, proposalData } = location.state || {};

  // Add validation for required data
  useEffect(() => {
    if (!investorData || !proposalData) {
      toast.error('Missing required information');
      navigate(-1);
    }
  }, [investorData, proposalData, navigate]);

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      console.log('Payment Response:', paymentResponse);
      console.log('Investor Data:', investorData);
      console.log('Proposal Data:', proposalData);
      console.log('Version Name being sent:', proposalData.versionId);
      console.log('Full Proposal Data:', proposalData);

      if (!investorData?._id || !proposalData?.proposalId || !proposalData?.versionId) {
        throw new Error('Missing required data');
      }

      // Simplify the request body structure to match the schema
      const requestBody = {
        proposalId: proposalData.proposalId,
        investorId: investorData._id,
        selectedProposal: {
          proposalId: proposalData.proposalId,
          versionId: proposalData.versionId  // This will now send "P1/A" format to backend
        },
        paymentDetails: {
          orderId: paymentResponse.paymentDetails.orderId,
          paymentId: paymentResponse.paymentDetails.paymentId,
          amount: paymentResponse.paymentDetails.amount,
          timestamp: new Date()
        }
      };

      // console.log('Request Body:', requestBody);
      console.log('Final Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/business-proposal/create-investor-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create connection');
      }
      const paymentStatusResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/investor/update-proposal-payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorId: investorData._id,
          proposalId: proposalData.proposalId,
          payment_done_from_owner_status: true
        })
      });

      if (!paymentStatusResponse.ok) {
        console.error('Failed to update payment status');
      }

      if (data.status) {
        toast.success('Payment successful! Connection established with investor.');
        navigate('/home');
      } else {
        throw new Error(data.message || 'Failed to create connection');
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error('Error establishing connection. Please try again.');
    }
  };

  if (!investorData || !proposalData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Connect with Investor</h2>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Selected Proposal Details:</h3>
            <p className="text-gray-600">Proposal: {proposalData.proposalNumber || 'N/A'}</p>
            <p className="text-gray-600">Version: {proposalData.versionNumber || 'N/A'}</p>
            <p className="text-gray-600">Name: {proposalData.proposalName || 'Untitled'}</p>
            <p className="text-gray-600">Version Name: {proposalData.versionId || 'Untitled'}</p>
          </div>
          <p className="text-gray-600 mb-6">
            To establish connection with {investorData.fullName}, please complete the payment of ₹1,000
          </p>

          <div className="border-t border-gray-200 pt-6">
            <RazorpayPayment 
              amount="1000"
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                console.error('Payment failed:', error);
                toast.error('Payment failed. Please try again.');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;