import { Routes, Route } from "react-router-dom";
import {Homepage, RegisterPage, UserVerificationPage, LoginPage, CompanyPage} from "./src/pages";
import Layout from "./src/layouts/Layout.jsx";
import ProtectedRoutes from "./src/layouts/ProtectedRoutes.jsx";

const NotFound = () => <h1 className="text-4xl text-center mt-10">404 - Page Not Found</h1>;

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/company/:companyUsername" element={<CompanyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/verify-otp" element={<UserVerificationPage />} />
      </Route>


      {/* Protected routes */}
      <Route element={<ProtectedRoutes />}>
        {/* <Route path="/home" element={<Home />} /> */}
      
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />


    </Routes>
  );
}

export default AppRouter;
