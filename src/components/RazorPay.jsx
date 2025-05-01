// RazorPay.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RazorpayPayment = ({ 
  amount, 
  option, 
  proposalId, 
  advisorType,
  businessType,
  valuationType,
  valuation,
  rating,
  onSuccess,
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const orderResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create-order`, {
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'INR'
      });

      if (!orderResponse.data.data?.id) {
        throw new Error('Missing order ID in server response');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.data.amount,
        currency: 'INR',
        name: 'Hubridge',
        description: 'Professional Advisor Package',
        order_id: orderResponse.data.data.id,
        notes: {
          proposalId: proposalId,
          advisorType: advisorType
        },
        handler: async function (response) {
          try {
            const validationResponse = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/verify-payment`, 
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                notes: {
                  proposalId: proposalId
                },
                amount: amount
              }
            );
        
            if (validationResponse.data.status) {
              if (onSuccess) {
                onSuccess({
                  ...validationResponse.data,
                  paymentDetails: {
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    amount: amount
                  }
                });
              }
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            if (onError) {
              onError(new Error('Payment verification failed. Please try again.'));
            }
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9191919191'
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay via UPI or Net Banking',
                instruments: [
                  { method: 'upi' },
                  { method: 'netbanking' }
                ]
              },
              cards: {
                name: 'Pay via Card',
                instruments: [
                  { method: 'card' }
                ]
              }
            },
            sequence: ['block.banks', 'block.cards'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: '#16a34a' // Updated to green color
        },
        modal: {
          backdropclose: false,
          escape: false,
          handleback: true,
          confirm_close: true,
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (resp) {
        console.error('Payment failed:', resp.error);
        if (onError) {
          onError(new Error(resp.error.description || 'Payment failed. Please try again.'));
        }
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      if (onError) {
        onError(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full py-3 px-6 rounded-lg text-lg font-medium transition-colors ${
        isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {isLoading ? 'Processing Payment...' : `Proceed to Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;