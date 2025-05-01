// services/pitchDeckApi.js

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to map frontend proposal types to backend enum values
const mapProposalType = (frontendType) => {
  const typeMap = {
    'equity_funding': 'Equity Funding',
    'partial_exit': 'Partial',
    'full_exit': 'Full'
  };
  return typeMap[frontendType] || frontendType;
};

export const pitchDeckApi = {
  // Create new proposal version
  createProposalVersion: async (formData) => {
    try {
      // Map the proposal type to match backend enum
      const mappedProposalType = mapProposalType(formData.proposalType);

      const proposalData = {
        proposalId: formData.proposalId,
        proposals: [{
          proposalNumber: formData.proposalNumber,
          versions: [{
            versionNumber: formData.proposalVersion.split('/')[1] || 'A',
            proposalName: formData.proposalName,
            businessDesc: formData.businessDescription,
            products: formData.productsServices,
            proposalDesc: formData.proposalDescription,
            proposalType: mappedProposalType,
            currentValuation: formData.currentValuation.toString(),
            currentShares: formData.currentShares.toString(),
            
            // Type-specific details
            ...(mappedProposalType === 'Equity Funding' && {
              equityFundingDetails: {
                fundingReq: {
                  currencyType: 'INR',
                  value: formData.fundingRequired.toString()
                },
                categories: [],
                newFunding: formData.fundingRequired.toString()
              }
            }),
            
            ...(mappedProposalType === 'Partial' && {
              partialExitDetails: {
                plannedExit: formData.plannedExitPercentage.toString(),
                valuation: formData.currentValuation.toString(),
                exitValue: ((formData.currentValuation * formData.plannedExitPercentage) / 100).toString(),
                existingOwnership: (100 - formData.plannedExitPercentage).toString(),
                newOwnership: formData.plannedExitPercentage.toString(),
                totalOwnership: '100',
                partialExitVal: ((formData.currentValuation * formData.plannedExitPercentage) / 100).toString()
              }
            }),
            
            ...(mappedProposalType === 'Full' && {
              fullExitDetails: {
                plannedExit: '100',
                valuation: formData.currentValuation.toString(),
                exitValue: formData.currentValuation.toString(),
                existingOwnership: '0',
                newOwnership: '100',
                totalOwnership: '100',
                fullExitVal: formData.currentValuation.toString()
              }
            })
          }],
          documents_proposal: formData.pitchDocument ? [{
            type: 'pitch_doc',
            file: formData.pitchDocument.file
          }] : []
        }]
      };

      console.log('Sending proposal data:', JSON.stringify(proposalData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData)
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to update proposal');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to create proposal version');
    }
  },

  // Get proposal details
  getProposalDetails: async (proposalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }

      // Extract the latest proposal version
      const proposals = data.data.proposals || [];
      const latestProposal = proposals[proposals.length - 1] || {};
      const latestVersion = latestProposal.versions?.[latestProposal.versions?.length - 1] || {};

      // Map backend enum values back to frontend values
      const reverseTypeMap = {
        'Equity Funding': 'equity_funding',
        'Partial': 'partial_exit',
        'Full': 'full_exit'
      };
      
      return {
        proposalNumber: latestProposal.proposalNumber || 'P1',
        proposalVersion: `${latestProposal.proposalNumber || 'P1'}/A`,
        proposalName: latestVersion.proposalName || '',
        businessDescription: latestVersion.businessDesc || '',
        productsServices: latestVersion.products || '',
        proposalDescription: latestVersion.proposalDesc || '',
        proposalType: reverseTypeMap[latestVersion.proposalType] || '',
        currentValuation: Number(latestVersion.currentValuation) || 0,
        currentShares: Number(latestVersion.currentShares) || 0,
        fundingRequired: Number(latestVersion.equityFundingDetails?.fundingReq?.value) || 0,
        plannedExitPercentage: Number(latestVersion.partialExitDetails?.plannedExit) || 100,
        pitchDocument: latestProposal.documents_proposal?.[0] || null
      };
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to fetch proposal details');
    }
  }
};