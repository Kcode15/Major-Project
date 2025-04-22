import { Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { username } = useParams(); 
  const location = useLocation(); 

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (username && user.displayName !== username) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
