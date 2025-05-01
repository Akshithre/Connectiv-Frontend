import React, { createContext, useContext, useState } from 'react';

// Create the context
const BusinessProposalContext = createContext();

// Initial state based on the updated mongoose schema
const initialState = {
  // Basic information
  fullName: '',
  companyName: '',
  mobileNo: '',
  officialMail: '',
  profession: '',
  establishedDate: null,
  businessLocation: '',
  businessDesc: '',
  topProd: '',
  monthlySales: 0,

  // Documents and types
  documents: [], // Array of { type: String, file: String }
  businessType: '',
  valuationType: '',
  pitchCreationType: '',

  // Advisor details (new addition)
  advisorDetails: {
    type: '', // 'advisor' or 'self'
    cost: null
  },

  // Pitch document
  pitchDocument: {
    Slide0: {
      image: { type: '', file: '' },
      logo: { type: '', file: '' },
      claim: '',
      month_year: ''
    },
    Slide1: {
      operationType: '',
      valuationMethod: '',
      sharesOffer: '',
      currency: ''
    },
    Slide2: {
      businessInfo: {
        name: '',
        logo: { type: '', file: '' }
      },
      productPictures: [], // Array of { type: String, file: String }
      founders: [], // Array of { image: { type: String, file: String }, name: String, background: String }
      strengths: new Map(),
      targetedMarketSize: {
        year: null,
        segments: new Map(),
        totalValue: {
          amount: null,
          currency: '',
          scale: ''
        }
      },
      opportunity_data: {
        currentYear: null,
        targetYear: null,
        currentValue: {
          amount: null,
          currency: '',
          scale: ''
        },
        futureValue: {
          amount: null,
          currency: '',
          scale: ''
        },
        cagr: ''
      },
      developmentFields: {
        productDev: [],
        targetCustomers: [],
        marketUsp: []
      }
    },
    Slide3: {
      timelineData: new Map()
    },
    slide4: { // Changed from historicalPerformance to slide4
      volume: { dataPoints: new Map() },
      volumeDesc: '',
      revenue: { dataPoints: new Map() },
      revenueDesc: '',
      ebitda: { 
        dataPoints: new Map() // Updated to match backend schema
      },
      ebitdaDesc: ''
    },
    slide5: { // Changed from Slide4
      revenueStartYear: null,
      revenueStartMonth: null,
      revenueTargetYear: null,
      yearlyData: new Map(),
      revenueModelDesc: ''
    },
    slide6: { // Changed from Slide5
      profitEstimates: [], // Array of { name: String, values: Map }
      kpiMetrics: [] // Array of { name: String, unit: String, values: Map }
    },
    slide7: { // Changed from Slide6
      content: [],
      bar_or_line: ''
    },
    slide8: { // Changed from Slide7
      cashEstimates: [], // Array of { name: String, values: Map }
      workingCapital: '',
      capex: ''
    },
    slide9: { // Changed from Slide8
      dcfBased: {
        discountRate: null,
        perpetualGrowthRate: null,
        netDebt: null,
        tableData: [] // Array of { name: String, values: Map }
      },
      newIssue: {
        existingInvestors: '',
        newInvestors: '',
        tableData: [] // Array of { name: String, values: Map }
      },
      spend: {
        categories: new Map()
      },
      seriesAnotes: ''
    },
    slide10: { // Changed from Slide9
      dcfBased: {
        discountRate: null,
        perpetualGrowthRate: null,
        netDebt: null,
        tableData: [] // Array of { name: String, values: Map }
      },
      existingStake: new Map(), // Updated to match backend schema
      exit_ofs: ''
    },
    slide11: { // Changed from Slide10
      ebitdaMultiple: null,
      externalNetDebt: null,
      ebitda_basedSchema: {
        categories: new Map(),
        negativeAdjustments: '',
        positiveAdjustments: ''
      },
      newIssue: {
        existingInvestors: '',
        newInvestors: '',
        tableData: [] // Array of { name: String, values: Map }
      },
      spend: {
        categories: new Map()
      },
      seriesAnotes: ''
    },
    slide12: { // Changed from Slide11
      ebitdaMultiple: null,
      externalNetDebt: null,
      ebitda_basedSchema: {
        categories: new Map(),
        negativeAdjustments: '',
        positiveAdjustments: ''
      },
      existingStake: new Map(),
      seriesAnotes: ''
    },
    slide13: { // Changed from Slide12
      contentPairs: [] // Array of { image: { type: String, file: String }, description: String }
    },
    slide14: { // Changed from Slide13
      name_final: '',
      description_final: '',
      ph_no: '',
      mail: '',
      image: { type: '', file: '' }
    }
  },

  // Valuations
  dcfValuation: {
    revenue: new Map(),
    ebitda: new Map(),
    capex: new Map(),
    perpetualGrowthRate: null,
    wcap: null,
    grossDebt: null,
    valuation: null,
    rating: ''
  },
  ebitdaValuation: {
    revenue: new Map(),
    ebitda: new Map(),
    grossDebt: null,
    valuation: null,
    rating: ''
  }
};

export const BusinessProposalProvider = ({ children }) => {
  const [businessProposal, setBusinessProposal] = useState(initialState);

  // Helper function to update nested state
  const updateBusinessProposal = (path, value) => {
    setBusinessProposal(prevState => {
      const newState = { ...prevState };
      const pathArray = path.split('.');
      let current = newState;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
          current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      return newState;
    });
  };

  // Helper function to update Map objects
  const updateMap = (path, key, value) => {
    setBusinessProposal(prevState => {
      const newState = { ...prevState };
      const pathArray = path.split('.');
      let current = newState;
      
      for (let i = 0; i < pathArray.length; i++) {
        if (!current[pathArray[i]]) {
          current[pathArray[i]] = new Map();
        }
        current = current[pathArray[i]];
      }
      
      if (current instanceof Map) {
        current.set(key, value);
      }
      
      return newState;
    });
  };

  const value = {
    businessProposal,
    updateBusinessProposal,
    updateMap,
    setBusinessProposal
  };

  return (
    <BusinessProposalContext.Provider value={value}>
      {children}
    </BusinessProposalContext.Provider>
  );
};

// Custom hook for using the business proposal context
export const useBusinessProposal = () => {
  const context = useContext(BusinessProposalContext);
  if (context === undefined) {
    throw new Error('useBusinessProposal must be used within a BusinessProposalProvider');
  }
  return context;
};

// Export the context for any advanced use cases
export default BusinessProposalContext;