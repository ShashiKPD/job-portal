import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios"; // Your Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage if available
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Function to update user and persist in storage
  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
    setUser(userData);
  };
  
  // Check if the user is still authenticated on app load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get("/users/me", { withCredentials: true });
        updateUser(response.data.data.user);
        // console.log("User authenticated:", response.data.data.user);
      } catch (error) {
        updateUser(null); // Log out if the session is invalid
        console.log("Session expired:", error);
      }
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
