import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NavBar from "../components/NavBar.jsx";
import Layout from "./Layout.jsx";

const ProtectedRoutes = () => {
  const { user } = useAuth(); // Get user from AuthContext
  // const user = { name: "John Doe", email: "" }; // Mock user data
  // console.log("user: ", user);
  
  return user ? 
  <>
    <Layout />
  </>
  : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
