import { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";

const Dashboard = () => {
    const { user } = useAuth();

    useEffect(() => {
        const verifyFirebaseToken = async () => {
            if (!user) return;

            const firebaseToken = await user.getIdToken(); // Get Firebase token

            const response = await fetch("http://127.0.0.1:8000/auth/verify-firebase/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ firebase_token: firebaseToken })
            });

            const data = await response.json();
            console.log("Firebase Verification Response:", data);
        };

        verifyFirebaseToken();
    }, [user]);

    return (
        <div>
            <h1>Welcome, {user ? user.displayName : "Guest"}</h1>
        </div>
    );
};

export default Dashboard;
