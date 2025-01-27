import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const cookies = document.cookie.split(";").map(cookie => cookie.trim());

  const hasAccessToken = cookies.some(cookie => cookie.startsWith("accessToken="));
  const hasRefreshToken = cookies.some(cookie => cookie.startsWith("refreshToken="));

  return hasAccessToken && hasRefreshToken;
};


const Layout = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default Layout;