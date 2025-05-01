import React from 'react';
import { Search, LogIn, Mail, Phone, Globe, Linkedin } from 'lucide-react';

const BusinessProposalDashboard = () => {
  const proposals = [
    {
      id: 2,
      type: 'Sport Goods Franchise Opportunity',
      isPremium: true,
      company: 'SkyRoof India',
      location: 'Bangalore',
      established: '2007',
      franchises: 1,
      description: 'SkyRoof India is an 18-year-old company which manufactures tents, tent houses, and German event...',
      rating: 8,
      city: 'Guntur',
      monthlySales: '75 lakh',
      spaceRequired: '10000 - 20000 Sq Ft',
      investment: '1 - 1.5 Cr',
      contactType: 'Company'
    },
    {
      id: 3,
      type: 'Manpower Security Business Seeking Loan',
      company: 'Security firm specializing in',
      description: 'The company\'s primary focus is on supplying security guards to corporate clients, ensuring the safety and...',
      rating: 6,
      city: 'Guntur',
      monthlySales: '60 lakh',
      ebitdaMargin: '10 %',
      loanAmount: '5 L',
      interestRate: '10%',
      contactType: 'Business'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundImage: "url('/your-background-image.jpg')", backgroundSize: 'cover' }}>
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <img src="hubridge.png" alt="Company Logo" className="h-12" />
          
          <div className="flex-1 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <img src="india.png" alt="Indian Flag" className="w-6 h-6" />
              <span className="font-semibold">INR</span>
            </div>
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search proposals..."
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogIn className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Business Profile Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <h1 className="text-xl font-black mb-4">List your businesses on Hubridge M&A</h1>
            <p className="text-gray-600 mb-8">
              Get visibility from 110,000+ member network of Businesses, Investors, 
              Acquirers, Lenders and Advisors from 900+ Industries and 170+ Countries
            </p>
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 rounded transition-colors">
              Create Business Profile
            </button>
          </div>

          {/* Business Proposal Cards */}
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 relative">
              {proposal.isPremium && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-tr-lg rounded-bl-lg text-sm font-medium">
                  PREMIUM
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-blue-500 text-lg font-medium mb-2">{proposal.type}</h3>
                <h4 className="text-gray-800">
                  {proposal.company} 
                  {proposal.established && `, Established in ${proposal.established}`}
                  {proposal.franchises && `, ${proposal.franchises} Franchisee`}
                  {proposal.location && `, ${proposal.location}`}
                </h4>
              </div>

              <div className="flex gap-4 mb-4">
                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                  <Phone className="w-4 h-4" /> Phone
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                  <Globe className="w-4 h-4" /> Google
                </button>
                {proposal.id === 3 && (
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </button>
                )}
              </div>

              <p className="text-gray-600 mb-4">{proposal.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span> {proposal.rating}
                </span>
                <span className="text-gray-600">Expanding in</span>
                <span className="font-medium">{proposal.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">
                    {proposal.id === 2 ? 'Exp Monthly Sales' : 'Run Rate Sales'}
                  </p>
                  <p className="font-medium">INR {proposal.monthlySales}</p>
                </div>
                <div>
                  <p className="text-gray-600">
                    {proposal.id === 2 ? 'Space Required' : 'EBITDA Margin'}
                  </p>
                  <p className="font-medium">
                    {proposal.id === 2 ? proposal.spaceRequired : proposal.ebitdaMargin}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-gray-600">
                    {proposal.id === 2 ? 'Investment Required' : 'Business Loan'}
                  </p>
                  <p className="font-medium">
                    INR {proposal.id === 2 ? proposal.investment : `${proposal.loanAmount} at ${proposal.interestRate}`}
                  </p>
                </div>
                <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded transition-colors">
                  Contact {proposal.contactType}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BusinessProposalDashboard;