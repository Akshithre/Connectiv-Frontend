import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('checking');
    const { setUserDetails } = useAuth();

    useEffect(() => {
        const checkVerification = async () => {
            try {
                if (auth.currentUser) {
                    // Force reload user to get latest status
                    await auth.currentUser.reload();
                    
                    if (auth.currentUser.emailVerified) {
                        // Get user details from backend
                        const response = await fetch(`${API_BASE_URL}/api/users/get-user-by-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                email: auth.currentUser.email 
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.status && data.data) {
                                setUserDetails({
                                    userId: data.data._id,
                                    userType: data.data.userType,
                                    email: data.data.email,
                                    fullName: data.data.fullName
                                });
                                setVerificationStatus('verified');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Verification check error:', error);
            }
        };

        const interval = setInterval(checkVerification, 2000);
        return () => clearInterval(interval);
    }, [setUserDetails]);

    useEffect(() => {
        if (verificationStatus === 'verified') {
            // Add a small delay before redirecting
            const timer = setTimeout(() => {
                navigate('/home');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [verificationStatus, navigate]);

    const handleContinue = async () => {
        try {
            // Force reload user
            await auth.currentUser?.reload();
            
            if (auth.currentUser?.emailVerified) {
                navigate('/home');
            } else {
                setVerificationStatus('unverified');
            }
        } catch (error) {
            console.error('Continue error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                {verificationStatus === 'checking' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Checking verification status...</p>
                        <p className="text-sm text-gray-500 mt-4">
                            Please check your email and click the verification link.
                        </p>
                        <button
                            onClick={handleContinue}
                            className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            I've verified my email
                        </button>
                    </div>
                )}

                {verificationStatus === 'verified' && (
                    <div className="text-center">
                        <div className="text-emerald-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">
                            Redirecting you to the dashboard...
                        </p>
                    </div>
                )}

                {verificationStatus === 'unverified' && (
                    <div className="text-center">
                        <div className="text-yellow-500 text-5xl mb-4">!</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Not Yet Verified</h2>
                        <p className="text-gray-600 mb-6">
                            Please check your email and click the verification link.
                        </p>
                        <button
                            onClick={() => setVerificationStatus('checking')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Check Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;