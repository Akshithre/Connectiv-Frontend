import React, { createContext, useContext, useState } from 'react';

const InvestorContext = createContext();

export const useInvestor = () => {
  const context = useContext(InvestorContext);
  if (!context) {
    throw new Error('useInvestor must be used within an InvestorProvider');
  }
  return context;
};

export const InvestorProvider = ({ children }) => {
  const [investor, setInvestor] = useState(null);

  return (
    <InvestorContext.Provider value={{ investor, setInvestor }}>
      {children}
    </InvestorContext.Provider>
  );
};