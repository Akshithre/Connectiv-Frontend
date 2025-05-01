import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { LogIn, User } from 'lucide-react';
import logo from '../../assets/logo.png';
import NotificationDropdown from './NotificationDropdown';

const NavbarInvestor = () => {
    const { logout, userDetails } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-green-700 to-green-500 text-white shadow-md p-4">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo and Branding */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/investor-home')}>
                    <img src={logo} alt="Company Logo" className="h-12" />
                    <span className="text-2xl font-bold hover:text-yellow-300 transition-colors">Connectiv</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center space-x-6">
                    <Link
                        to="/investor-home"
                        className="text-white font-medium px-2 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-all"
                    >
                        Dashboard
                    </Link>
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="font-medium">
                            Logged in as {userDetails?.fullName || 'User'}
                        </span>
                    </div>

                    {/* Notification Dropdown - Using MongoDB userId */}
                    {userDetails?.userId && (
                        <NotificationDropdown userId={userDetails.userId} />
                    )}

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-grey-400 hover:bg-grey-100 text-white font-semibold rounded-lg transition-all shadow-lg"
                    >
                        <LogIn className="w-5 h-5" />
                        Logout   
                    </button>
                </div>
            </div>
        </header>
    );
};

export default NavbarInvestor;