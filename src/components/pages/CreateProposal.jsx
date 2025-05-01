// CreateProposalPitch.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/pages/Navbar';
import { useBusinessProposal } from '../../providers/businessProposalContextProvider';

const ProgressSteps = () => {
  const currentStep = 3;
  const steps = [
    { id: 1, name: 'Register' },
    { id: 2, name: 'Business Valuation' },
    { id: 3, name: 'Create Proposal/Pitch' },
    { id: 4, name: 'Find Investors' },
    { id: 5, name: 'Improve Valuation' }
  ];

  return (
    <div className="flex justify-center items-center my-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center relative">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium cursor-default
                ${step.id <= currentStep 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : 'border-gray-300 text-gray-500'}`}
            >
              {step.id}
            </div>
            <span className="absolute top-12 w-24 text-xs text-center">
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-24 h-0.5 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const CreateProposalPitch = () => {
  const [currentStep, setCurrentStep] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { businessProposal } = useBusinessProposal();
  const [error, setError] = useState(null);
  
  const proposalId = location.state?.proposalId;
  const businessType = location.state?.businessType;
  const valuationType = location.state?.valuationType;
  const valuation = location.state?.valuation;
  const rating = location.state?.rating;

  const handleAdvisorSelection = async (type) => {
    if (!proposalId) {
      setError('No proposal ID found. Please start from the beginning.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/business-proposal/update-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          advisorType: type
        })
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to update advisor selection');
      }

      // Always navigate to post-payment, but with different costs
      navigate('/post-payment', {
        state: { 
          proposalId,
          advisorType: type,
          businessType,
          valuationType,
          valuation,
          rating,
          cost: type === 'self' ? 0 : 25000 // 0 for self, 25000 for advisor
        }
      });

    } catch (error) {
      console.error('Error updating advisor selection:', error);
      setError(error.message || 'Failed to update advisor selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PricingCard = ({ title, price, features, type }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-transform duration-300 border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <div className="text-4xl font-bold mb-2">
            {price === 'Free' ? (
              <span className="text-green-600">{price}</span>
            ) : (
              <span className="text-gray-900">₹{price}</span>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => handleAdvisorSelection(type)}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors mt-8
          ${type === 'self' 
            ? 'bg-green-600 text-white border-2 hover:bg-green-700'
            : 'bg-green-600 text-white hover:bg-green-700'}`}
      >
        {isLoading ? 'Processing...' : `Choose ${title}`}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <ProgressSteps currentStep={currentStep} />
        
        <div className="mb-16 mt-16">
          <h1 className="text-2xl font-semibold mb-2">3. Create Proposal / Investor Pitch</h1>
          <p className="text-gray-600 text-lg">
            Choose how you would like to proceed with creating your proposal and investor-oriented pitch document.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            title="Self"
            price="Free"
            type="self"
            features={[
              "Guided field-template, for a simple proposal creation",
              "Flexibility to upload your offline-prepared Pitch Deck",
              "Create and update multiple versions, depending on audience",
              "E-Mail / Phone support, in case you need some help"
            ]}
          />
          
          <PricingCard 
            title="Professional Advisor"
            price="25,000"
            type="advisor"
            features={[
              "Customised Pitch deck preparation by our advisor",
              "Industry-specific content and moderation",
              "Expert business/financial advice, targeted for gain investors",
              "Delivery in less than 2-weeks",
              "Direct communication with advisor",
              "Multiple changes possible, upto 60 days"
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProposalPitch;