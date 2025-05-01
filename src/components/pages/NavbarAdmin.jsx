import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { LogIn } from 'lucide-react';
import logo from '../../assets/logo.png';

const NavbarAdmin = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await doSignOut();
            logout(); // Call the logout function from auth context
            navigate('/', { replace: true }); // Using replace to prevent going back
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-green-700 to-green-500 text-white shadow-md p-4">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo and Branding */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
                    <img src={logo} alt="Company Logo" className="h-12" />
                    <span className="text-2xl font-bold hover:text-yellow-300 transition-colors">Connectiv</span>
                </div>

               

                {/* Right Section */}
                <div className="flex items-center gap-4">
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

export default NavbarAdmin;