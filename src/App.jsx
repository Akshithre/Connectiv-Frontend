import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import { PitchDeckProvider } from './components/pages/PitchDeck/context/PitchDeckContext';
import { BusinessProposalProvider } from './providers/businessProposalContextProvider';
import { InvestorProvider } from './providers/investorContextProvider';
import LandingPage from './pages/landingpage';
import Home from './components/pages/Home';
import Contactus from './components/pages/contactus';
import VerifyEmail from './components/pages/VerifyEmail';
import PrivateRoute from './components/PrivateRoute';
import BusinessValuation from './components/pages/BusinessValuation/BusinessValuation';
import CreateProposal from './components/pages/CreateProposal';
import BusinessProposalForm from './components/pages/BusinessProposalForm';
import PitchDeck from './components/pages/PitchDeck/PitchDeck';
import PostPayment from './components/pages/PostPayment';
import FindInvestors from './components/pages/FindInvestors';
import PitchDeck1 from './components/pages/PitchDeck';
import InvestorProfile from './components/investors/InvestorProfile';
import InvestorHome from './components/investors/InvestorHome';
import FindBusiness from './components/investors/FindBusiness';
import ContactBusiness from './components/investors/contactBusiness';
import ContactInvestor from './components/pages/contactInvestor';
import ViewInvestorDetails from './components/pages/ViewInvestorDetails';
import PaymentPage from './components/pages/PaymentPage';
import CommonPage from './components/pages/CommonPages';
import AdminDashboard from './pages/adminDashboard';


const App = () => {
  return (
    <AuthProvider>
      <BusinessProposalProvider>
        <InvestorProvider>  {/* Add InvestorProvider here */}
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route 
                path="/home" 
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/contactus" 
                element={
                  <PrivateRoute>
                    <Contactus />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/business-proposalform" 
                element={
                  <PrivateRoute>
                    <BusinessProposalForm />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/create-proposal" 
                element={
                  <PrivateRoute>
                    <CreateProposal />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/pitchdeck" 
                element={
                  <PrivateRoute>
                    <PitchDeck1 />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/post-payment" 
                element={
                  <PrivateRoute>
                    <PostPayment />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/find-investors" 
                element={
                  <PrivateRoute>
                    <FindInvestors />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/pitch-deck" 
                element={
                  <PrivateRoute>
                    <PitchDeckProvider>
                      <PitchDeck />
                    </PitchDeckProvider>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/business-valuation/established" 
                element={
                  <PrivateRoute>
                    <BusinessValuation type="established" />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/business-valuation/startup" 
                element={
                  <PrivateRoute>
                    <BusinessValuation type="startup" />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/business-valuation" 
                element={
                  <PrivateRoute>
                    <BusinessValuation type="established" />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/investor-profile" 
                element={
                  <PrivateRoute>
                    <InvestorProfile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/find-business" 
                element={
                  <PrivateRoute>
                    <FindBusiness />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/investor-home" 
                element={
                  <PrivateRoute>
                    <InvestorHome />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/contact-business/:proposalId" 
                element={
                  <PrivateRoute>
                    <ContactBusiness />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/contact-investor/:investorId" 
                element={
                  <PrivateRoute>
                    <ContactInvestor />
                  </PrivateRoute>
                } 
              />
               <Route 
                path="/investor-profile/:investorId" 
                element={
                  <PrivateRoute>
                    <ViewInvestorDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/payment-page" 
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/common-page" 
                element={
                  <PrivateRoute>
                    <CommonPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
             
              

            </Routes>
          </Router>
        </InvestorProvider>
      </BusinessProposalProvider>
    </AuthProvider>
  );
};

export default App;