import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "../api/axios.js";
import { InputField, InputLabel } from "../components";
import { useSnackbar } from "notistack";

// Sleep function to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const UserVerificationPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm();
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm();

  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(60);
  const [phoneCooldown, setPhoneCooldown] = useState(60);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendingPhone, setResendingPhone] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCooldown]);

  useEffect(() => {
    if(emailVerified && phoneVerified) {
      // Redirect to login page
      enqueueSnackbar("Email and Phone verified successfully. Please login to continue.", { variant: "success" });
      sleep(1000).then(() => navigate("/login"));
    }
  },[emailVerified, phoneVerified]);

  useEffect(() => {
    if(localStorage.getItem("emailVerified") === "true") {
      setEmailVerified(true); 
      localStorage.removeItem("emailVerified");
    }
    if(localStorage.getItem("phoneVerified") === "true") {
      setPhoneVerified(true);
      localStorage.removeItem("phoneVerified");
    }
  }, []);

  const onEmailSubmit = async (data) => {
    try {
      setEmailLoading(true);
      setEmailError("");

      const response = await axios.post("/users/verify-otp", {
        email: localStorage.getItem("email"),
        otp: data.emailOTP,
      });

      console.log("Email Verified:", response.data);
      setEmailVerified(true);
    } catch (error) {
      setEmailError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const onPhoneSubmit = async (data) => {
    try {
      setPhoneLoading(true);
      setPhoneError("");

      const response = await axios.post("/users/verify-otp", {
        phone: localStorage.getItem("phone"),
        otp: data.phoneOTP,
      });

      console.log("Phone Verified:", response.data);
      setPhoneVerified(true);
    } catch (error) {
      setPhoneError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const resendEmailOTP = async () => {
    if (emailCooldown > 0) return;
    try {
      setResendingEmail(true);
      await axios.post("/users/regenerate-otp", { email: localStorage.getItem("email") });
      setEmailCooldown(60);
      enqueueSnackbar("Email OTP sent successfully.", { variant: "success" });
    } catch (error) {
      console.error("Error resending email OTP:", error.response?.data);
      setEmailError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  const resendPhoneOTP = async () => {
    if (phoneCooldown > 0) return;
    try {
      setResendingPhone(true);
      await axios.post("/users/regenerate-otp", { phone: localStorage.getItem("phone") });
      setPhoneCooldown(60);
      enqueueSnackbar("Phone OTP sent successfully.", { variant: "success" });
    } catch (error) {
      console.error("Error resending phone OTP:", error.response?.data);
      setPhoneError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setResendingPhone(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">User Verification</h2>

      {/* Email OTP Form */}
      <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
        <div>
          <InputLabel label="Email OTP" name="emailOTP" />
          <InputField
            name="emailOTP"
            register={register}
            validation={{ required: "Email OTP is required" }}
            error={emailErrors.emailOTP}
            />
        </div>
        {emailError && <div className="text-red-500 text-sm mb-4">{emailError}</div>}
        <button
          type="submit"
          className={`${emailVerified ? "bg-cyan-200 text-black font-semibold":"text-white bg-cyan-600 hover:bg-cyan-700"} w-full py-2 px-4 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-300`}
          disabled={emailLoading || emailVerified}
        >
          {emailLoading ? "Verifying..." : emailVerified ? "Verified" : "Verify Email OTP"}
        </button>
      </form>
      {!emailVerified && (
        <button
          type="button"
          onClick={resendEmailOTP}
          className={`${emailCooldown ? "cursor-not-allowed" : "hover:bg-slate-300 cursor-pointer"} shrink-0 py-2 px-4 bg-slate-200 text-slate-900 rounded-lg mt-2`}
          disabled={emailCooldown > 0 || resendingEmail}
        >
          {emailCooldown > 0 ? `Resend OTP in ${emailCooldown}s` : resendingEmail ? "Resending..." : "Resend OTP"}
        </button>
      )}
      {/* Phone OTP Form */}
      <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className="space-y-4 mt-4">
        <div>
          <InputLabel label="Phone OTP" name="phoneOTP" />
          <InputField
            name="phoneOTP"
            register={registerPhone}
            validation={{ required: "Phone OTP is required" }}
            error={phoneErrors.phoneOTP}
            />
        </div>
        {phoneError && <div className="text-red-500 text-sm mb-4">{phoneError}</div>}
        <button
          type="submit"
          className={`${phoneVerified ? "bg-cyan-200 text-black font-semibold":"text-white bg-cyan-600 hover:bg-cyan-700"} w-full py-2 px-4 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-300`}
          disabled={phoneLoading || phoneVerified}
        >
          {phoneLoading ? "Verifying..." : phoneVerified ? "Verified" : "Verify Phone OTP"}
        </button>
      </form>
      {!phoneVerified && (
        <button
          type="button"
          onClick={resendPhoneOTP}
          className={`${phoneCooldown ? "cursor-not-allowed": "hover:bg-slate-300 cursor-pointer"} shrink-0 py-2 px-4 bg-slate-200 text-slate-900 rounded-lg mt-2`}
          disabled={phoneCooldown > 0}
        >
          {phoneCooldown > 0 ? `Resend OTP in ${phoneCooldown}s` : resendingPhone ? "Resending..." : "Resend OTP"}
        </button>
      )}
    </div>
  );
};

export default UserVerificationPage;
