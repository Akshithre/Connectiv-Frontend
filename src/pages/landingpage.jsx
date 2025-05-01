import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { 
  CircleDollarSign, 
  BarChart2,
  Landmark,
  ShieldCheck,
  Wallet,
  FileText,
  ArrowRight,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import backgroundImage from '../assets/background.jpg';
import landingImage from '../assets/thirdsection.avif';
import thirdSectionImage from '../assets/landing.avif';
import logo from '../assets/logo.png';
import indiaFlag from '../assets/India.png';
import { 
  doCreateUserWithEmailAndPassword, 
  doSignInWithEmailAndPassword, 
  doSendEmailVerification 
} from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ModernLandingPage = () => {
  const navigate = useNavigate();
  const { userLoggedIn,setUserDetails } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
const [registerUsername, setRegisterUsername] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      if (registerPassword !== confirmPassword) {
        setErrorMessage("Passwords don't match");
        return;
      }
      if (!fullName || !phoneNumber || !userType|| !registerUsername || !registerEmail) {
        setErrorMessage("Please fill in all fields");
        return;
      }
  
      setIsRegistering(true);
      setErrorMessage('');
  
      try {
        // Register user with backend
        const registerResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName,
            username: registerUsername.toLowerCase(),
            email: registerEmail.toLowerCase(),
            phoneNumber,
            userType,
            password: registerPassword
          }),
        });
  
        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.message || 'Failed to register user');
        }
  
        // After successful registration, automatically log in the user
        const loginResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: registerUsername.toLowerCase(),
            password: registerPassword
          }),
        });
  
        if (!loginResponse.ok) {
          throw new Error('Auto-login failed after registration');
        }
  
        const loginData = await loginResponse.json();
        
        if (loginData.status && loginData.data) {
          const userDetails = {
            userId: loginData.data.userId,
            userType: loginData.data.userType,
            username: loginData.data.username,
            fullName: loginData.data.fullName
          };
          
          setUserDetails(userDetails);
          localStorage.setItem('userDetails', JSON.stringify(userDetails));
          
          setShowRegister(false);
          // Redirect based on user type
          if (userDetails.userType === "investor") {
            navigate('/investor-home');
          } else if (userDetails.userType === "business_owner") {
            navigate('/home');
          }
        }
  
      } catch (error) {
        console.error('Registration/Login error:', error);
        setErrorMessage(error.message || 'Registration failed');
      } finally {
        setIsRegistering(false);
      }
    }
  };

  // In landingpage.jsx, update the handleLogin function
// In landingpage.jsx, update the handleLogin function
const handleLogin = async (e) => {
  e.preventDefault();
  if (!isSigningIn) {
    setIsSigningIn(true);
    setErrorMessage('');
    
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUsername.toLowerCase(),
          password: loginPassword
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await loginResponse.json();
      
      if (data.status && data.data) {
        const userDetails = {
          userId: data.data.userId,
          userType: data.data.userType,
          username: data.data.username,
          fullName: data.data.fullName
        };
        
        setUserDetails(userDetails);
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        setShowLogin(false);
        if (data.data.userType === "admin") {
          navigate('/admin-dashboard');
        } else if (data.data.userType === "investor") {
          navigate('/investor-home');
        } else if (data.data.userType === "business_owner") {
          navigate('/home');
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Invalid username or password');
    } finally {
      setIsSigningIn(false);
    }
  }
};

  const handleResendVerification = async () => {
    try {
      await doSendEmailVerification();
      setErrorMessage('Verification email sent!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error sending verification email');
    }
  };

  return (
    // Find this container in your code (it's near the beginning of the return statement):
<div className="min-h-screen bg-emerald-900 py-8 px-4 md:py-12 md:px-8" style={{
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}}>
  {/* Main white frame container - Update this div's styles */}
  <div className="max-w-[1400px] mx-auto bg-white rounded-[1rem] overflow-hidden shadow-2xl" 
       style={{ 
        border: '2px solid rgba(255, 255, 255, 9)',  // Changed to white with opacity
        outline: '1px solid rgba(255, 255, 255, 0.3)',  // White outline
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'  // White glow effect
       }}>
    {/* Rest of your content */}
 {/* Header */}
<header className="bg-emerald-800 text-white">
  <div className="py-4 px-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center">
          <img src={logo} alt="HuBridge Logo" className="h-8 mr-2" />
          <span className="text-2xl font-bold">Connectiv</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#" className="text-white hover:text-yellow-300">Home</a>
          <a href="#" className="text-white hover:text-yellow-300">Business Owners</a>
          <a href="#" className="text-white hover:text-yellow-300">Investors</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center mr-4">
        <Phone className="h-5 mr-2" /> 
        <span>(+91)-9999999999</span>
        </div>
    
        <div className="flex items-center gap-4">
        <div className="flex items-center mr-4">
        <Mail className="h-5 mr-2" />
        <span>spam@gmail.com</span>
        </div>
        </div>


        <button 
          onClick={() => setShowLogin(true)}
          className="text-white hover:text-yellow-300"
        >
          Login
        </button>
        <button
          onClick={() => setShowRegister(true)}
          className="text-white border border-white px-4 py-2 rounded hover:bg-white/10"
        >
          Register
        </button>
      </div>
    </div>
  </div>
  {/* White line separator */}
  <div className="border-b border-white/20"></div>
</header>
       
        {/* Hero Section */}
        <section className="bg-emerald-800 text-white py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
              <h1 className="text-5xl font-bold mb-6">
              Create personal <span className="text-yellow-300">wealth</span>
               <br />
               as a business owner or private investor
              </h1>

                <p className="text-white/80 mb-8 max-w-xl">
                We provide seamless and guided experience to both business owners and private investors to connect, close “funding, M&A” deals and create personal wealth.
                </p>
                <button className="bg-yellow-300 text-emerald-800 px-8 py-3 rounded-md font-medium hover:bg-yellow-400 inline-flex items-center gap-2">
                  Register Now <ArrowRight className="w-5 h-5" />
                </button>
               
              </div>
              <div>
                <img src={landingImage} alt="Family Investment" className="rounded-lg shadow-xl w-full" />
              </div>
            </div>
          </div>
        </section>


        

        {/* Services Section */}
        <section className="bg-[#f5fbf7] py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              
              <h2 className="text-4xl font-bold text-emerald-800">
              For Business Owners<br />
               
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Landmark className="w-6 h-6" />,
                  title: "Fund your business",
                  description: "Experience seamless journey in finding new investors for your Start-up/SME business, in a quick and cost effective manner. "
                },
                {
                  icon: <BarChart2 className="w-6 h-6" />,
                  title: "Unlock Business Value",
                  description: "Get end-to-end professional help to find investors and monetise your shareholdings in existing business"
                },
                {
                  icon: <CircleDollarSign className="w-6 h-6" />,
                  title: "Improve Business Valuation",
                  description: "Get customised help to identify and implement levers to improve your valuation"
                }
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 hover:shadow-lg transition-all">
                  <div className="bg-emerald-800 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800 mt-6 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-emerald-800/70 mb-4">
                    {service.description}
                  </p>
                  <a href="#" className="inline-flex items-center text-sm text-emerald-800 hover:text-emerald-600">
                   
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-12">
  <h2 className="text-4xl font-bold text-emerald-800"><br></br>
    
  For Private Investors  </h2>
</div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "Access private equity opportunities – multiply your wealth",
                  description: "Access equity opportunities in profit-making private businesses across industries."
                },
                {
                  icon: < FileText className="w-6 h-6" />,
                  title: "Get professional help to perform diligence and valuation",
                  description: "Take informed decisions with our due-diligence, valuation and deal closure support."
                },
                {
                  icon: < Wallet className="w-6 h-6" />,
                  title: "Monitor Your Investments",
                  description: "Get professional help to monitor your private investments and ensure profit generation and value creation."
                }
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 hover:shadow-lg transition-all">
                  <div className="bg-emerald-800 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800 mt-6 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-emerald-800/70 mb-4">
                    {service.description}
                  </p>
                  <a href="#" className="inline-flex items-center text-sm text-emerald-800 hover:text-emerald-600">
                   
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="how-it-works" className="bg-gradient-to-br from-green-50 to-green-50 py-20 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-emerald-800 mb-4">Connectiv</h2>
      <p className="text-lg text-emerald-800">Connecting Business Owners and Private Investors</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
      <div className="bg-white border-2 border-emerald-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">Business Owners</h3>
        <p className="mb-12">Join our Portal <span className="font-semibold">Connectiv</span> to accelerate your fund raise plans.</p>

        <div className="relative flex flex-col items-center space-y-3">
          {[
            "Register on our portal for Free",
            "Get free Business Valuation",
            "Prepare Fund Raise Proposal",
            "Connect with Investors & Close deals"
          ].map((step, index) => (
            <div key={index} className="w-full max-w-md relative">
              <div className="bg-emerald-100 rounded-lg p-4 shadow-sm border border-emerald-300">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-emerald-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold shadow-md">
                  {index + 1}
                </div>
                <p className="ml-8 text-emerald-900 font-medium">{step}</p>
              </div>
              {index < 3 && (
                <div className="flex justify-center py-2">
                  <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-10 text-md text-emerald-900">
          <p className="font-semibold text-emerald-900">Our platform empowers you with right tools to,</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Understand the current value of your business, and potential ways to increase it</li>
            <li>Prepare a professional investment proposal (or) pitch deck</li>
            <li>Reach out to potential investors, with the right credentials and interest</li>
          </ul>
          <button className="mt-8 w-full py-3 px-6 bg-emerald-800 text-white rounded-lg hover:bg-emerald-800 font-semibold transition-colors duration-300 shadow-md hover:shadow-lg">
            Register now for FREE
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-emerald-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">Private Investors</h3>
        <p className="mb-12">Join our Portal <span className="font-semibold">Connectiv</span> to invest in profitable businesses</p>

        <div className="relative flex flex-col items-center space-y-3">
          {[
            "Register on our portal for Free",
            "Access investment opportunities",
            "Engage with owners and close deals",
            "Monitor Investment Growth"
          ].map((step, index) => (
            <div key={index} className="w-full max-w-md relative">
              <div className="bg-emerald-100 rounded-lg p-4 shadow-sm border border-emerald-300">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-emerald-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold shadow-md">
                  {index + 1}
                </div>
                <p className="ml-8 text-emerald-900 font-medium">{step}</p>
              </div>
              {index < 3 && (
                <div className="flex justify-center py-2">
                  <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

            <div className="mt-12 space-y-10 text-md text-emerald-900">
            <p className="font-semibold text-emerald-900">Our platform empowers you to access,</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>Exciting opportunities from verified SMEs and Start Ups, across industries</li>
            <li>Well presented business cases with easy-to-understand investment proposals</li>
            <li>Professionally managed businesses that are well-governed and agile</li>
          </ul>
        <button className="mt-8 w-full py-3 px-6 bg-emerald-800 text-white rounded-lg hover:bg-emerald-800 font-semibold transition-colors duration-300 shadow-md hover:shadow-lg">
          Register now for FREE
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <img src={logo} alt="HuBridge Logo" className="h-8 mb-6" />
                <p className="text-gray-400 text-sm">
                Connectiv is a trusted partner in business funding/exits, private investments and M&A opportunities 
                to both business owners and private investors<br></br><br></br>
                </p>
                <p className="text-gray-400 text-sm">
                Connectiv, is a technology/business initiative of Hubridge Financial and Business Partners.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                <li><a href="https://hubridge.co.in" className="text-gray-400 hover:text-white">About Us</a></li>
                <li>
        <a href="#how-it-works" 
          className="text-gray-400 hover:text-white transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('how-it-works').scrollIntoView({ 
              behavior: 'smooth' 
            });
          }}
        >
          How It Works
        </a>
      </li>

                 
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Business Valuation</li>
                  <li>M&A Advisory</li>
                  <li>Investment Banking</li>
                  <li>Due Diligence</li>
                  <li>Business Consulting</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: spam@gmail</li>
                  <li>Phone: (+91)-9999999999</li>
          
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Hubridge. All rights reserved.</p>
            </div>
          </div>
        </footer>
{/* Login Modal */}
{showLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-96 max-w-[90%]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Welcome Back</h3>
                <button 
                  onClick={() => setShowLogin(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
  <input
    type="text"
    value={loginUsername}
    onChange={(e) => setLoginUsername(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    required
  />
</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                {errorMessage && (
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className={`w-full py-2 rounded-lg text-white transition-colors ${
                    isSigningIn ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSigningIn ? 'Signing In...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        )}

{/* Register Modal */}
{showRegister && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-5 w-96 max-w-[90%]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Create Account</h3>
        <button 
          onClick={() => setShowRegister(false)} 
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="userType"
                value="investor"
                checked={userType === 'investor'}
                onChange={(e) => setUserType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
                required
              />
              <span className="text-sm">Investor</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="userType"
                value="business_owner"
                checked={userType === 'business_owner'}
                onChange={(e) => setUserType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Business Owner</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {errorMessage && (
          <p className="text-red-600 text-xs">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={isRegistering}
          className={`w-full py-2.5 rounded-lg text-white font-medium text-base transition-colors mt-4 ${
            isRegistering ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRegistering ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  </div>
)}

        {/* Email Verification Modal */}
        {showVerificationMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-96 max-w-[90%] text-center">
              <div className="mb-6">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-800">Verify Your Email</h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  We've sent a verification email to:
                  <br />
                  <span className="font-medium">{verificationEmail}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Please check your email and click the verification link to activate your account.
                </p>
                {errorMessage && (
                  <p className="text-sm text-green-600">{errorMessage}</p>
                )}
                <div className="space-y-2">
                  <button
                    onClick={handleResendVerification}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Resend Verification Email
                  </button>
                  <br />
                  <button
                    onClick={() => {
                      setShowVerificationMessage(false);
                      setShowLogin(true);
                    }}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernLandingPage;

