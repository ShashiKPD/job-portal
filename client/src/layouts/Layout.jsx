import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Layout = () => {
  const { user } = useAuth(); // Get user from AuthContext

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default Layout;
