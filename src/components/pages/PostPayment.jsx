// PostPayment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/pages/Navbar';
import RazorpayPayment from '../RazorPay';

// ... ProgressSteps component remains the same ...

const PostPayment = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    proposalId,
    advisorType,
    businessType,
    valuationType,
    valuation,
    rating,
    cost = advisorType === 'advisor' ? 25000 : 0
  } = location.state || {};

  // Set payment as complete automatically for self option
  useEffect(() => {
    if (advisorType === 'self') {
      setPaymentComplete(true);
    }
  }, [advisorType]);

  const handlePaymentSuccess = (data) => {
    setPaymentComplete(true);
    setPaymentDetails(data.paymentDetails);
  };

  const handleCreatePitch = async () => {
    if (!isChecked) {
      setError('Please agree to the terms and conditions before proceeding.');
      return;
    }

    if (!paymentComplete) {
      setError('Please complete the payment before proceeding.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      navigate('/pitchdeck', {
        state: {
          proposalId,
          advisorType,
          businessType,
          valuationType,
          valuation,
          rating,
          isAgreedToTerms: true,
          paymentDetails
        }
      });
    } catch (error) {
      setError('Failed to proceed to pitch deck creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
       
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-16 mt-16">
          <h1 className="text-2xl font-semibold mb-2">3. Create Proposal / Investor Pitch</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">
            {advisorType === 'advisor' 
              ? (paymentComplete ? 'Payment Confirmation' : 'Payment Request')
              : 'Terms Acceptance'}
          </h2>

          {advisorType === 'advisor' && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h4 className="text-xl font-bold mb-6">Payment Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Professional Advisor Package:</span>
                  <span className="font-medium">₹{cost}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>GST (18%):</span>
                  <span className="font-medium">₹{(cost * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span>₹{(cost * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!paymentComplete && (
                <div className="mt-8">
                  <RazorpayPayment 
                    amount={(cost * 1.18).toFixed(2)}
                    option={advisorType}
                    proposalId={proposalId}
                    advisorType={advisorType}
                    businessType={businessType}
                    valuationType={valuationType}
                    valuation={valuation}
                    rating={rating}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => setError(error.message || 'Payment failed. Please try again.')}
                  />
                </div>
              )}
            </div>
          )}

          {paymentComplete && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-700 font-medium">
                  {advisorType === 'advisor' 
                    ? 'Payment completed successfully!'
                    : 'Ready to proceed with self-creation option'}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-1 w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label className="text-gray-700">
                I agree to the <button className="text-green-600 underline">terms and conditions</button> of this engagement.
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={handleCreatePitch}
              disabled={!isChecked || (!paymentComplete && advisorType === 'advisor') || isLoading}
              className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                !isChecked || (!paymentComplete && advisorType === 'advisor') || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Proceed to Pitch Deck'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPayment;