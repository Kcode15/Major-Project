import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9mt1FqyuiAH0ZbaZPNzW-WBuFOHKSne4",
  authDomain: "legalsutra-c47e2.firebaseapp.com",
  projectId: "legalsutra-c47e2",
  storageBucket: "legalsutra-c47e2.appspot.com",
  messagingSenderId: "81700782534",
  appId: "1:81700782534:web:b2bee4e583c07a1498b2c7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    // Store token for API calls
    localStorage.setItem("token", token);

    console.log("User:", user);
    console.log("Token:", token);

    // 🔹 Send user UID to the backend for wallet creation
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, email: user.email }),
    });

    const data = await response.json();
    console.log("Wallet Response:", data);

    return { user, token, wallet: data };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("token");
    console.log("Logged out");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export { auth, signInWithGoogle, logout };
