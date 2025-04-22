import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { signInWithGoogle } from "../lib/firebase";
import Carousel from "../components/Carousel";// important import for carousel styling

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("User signed in with Google:", result.user);
          navigate("/");
        }
      } catch (error) {
        console.error("Redirect Sign-In Error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is already signed in:", user);
        navigate("/");
      }
    });

    checkRedirectResult();

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in successfully!");
      navigate("/");
    } catch (error) {
      console.error("Email Login Error:", error.message);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen  bg-gradient-to-r from-blue-500 to-purple-600">
      {/* Carousel Section */}
      <div className="hidden md:flex w-1/2 h-full p-8 items-center justify-center">
        <Carousel />
          </div>
          
           

      {/* Login Section */}
      <div className="flex items-center justify-center md:w-1/2 w-full p-8">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">LegalSutra</h1>
          <p className="text-gray-600 mb-6">Your trusted legal companion</p>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sign in</h2>

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Sign In
            </button>
          </form>

          {/* OR separator */}
          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            <img
              src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
              alt="Google Logo"
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>

          {/* Link to Signup page */}
          <p className="text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-purple-600 hover:underline font-semibold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
