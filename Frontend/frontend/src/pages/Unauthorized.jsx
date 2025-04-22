import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
  const { user } = useAuth(); // Get the logged-in user

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-gray-600">You are not authorized to view this page.</p>
      {user ? (
        <Link to={`/home/${user.displayName}`} className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Home
          </button>
        </Link>
      ) : (
        <Link to="/login" className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Login
          </button>
        </Link>
      )}
    </div>
  );
};

export default Unauthorized;
