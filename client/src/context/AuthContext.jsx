import { createContext, useContext, useState } from "react";

// Create the AuthContext
const AuthContext = createContext(null);

// Provide the AuthContext to the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state to store logged-in user's information

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
