// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useNavigate, useLocation  } from 'react-router-dom';
const PrivateRoute = ({ children }) => {
  const { userLoggedIn, userDetails } = useAuth();
  const location = useLocation();
  
  // Check both userLoggedIn and localStorage
  const isAuthenticated = userLoggedIn || localStorage.getItem('userDetails');

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
export default PrivateRoute;