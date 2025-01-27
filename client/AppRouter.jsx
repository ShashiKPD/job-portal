import { Routes, Route } from "react-router-dom";
import {Homepage, RegisterPage, UserVerificationPage, LoginPage} from "./src/pages";

const NotFound = () => <h1 className="text-4xl text-center mt-10">404 - Page Not Found</h1>;

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/verify-otp" element={<UserVerificationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
