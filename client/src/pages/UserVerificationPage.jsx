import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "../api/axios.js";
import {InputField, InputLabel} from "../components";

const UserVerificationPage = () => {
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
      if (error.response && error.response.data) {
        setEmailError(error.response.data.message || "An error occurred.");
        console.log("Email Error:", error.response.data);
      } else {
        setEmailError("An unexpected error occurred. Please try again.");
      }
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
      if (error.response && error.response.data) {
        setPhoneError(error.response.data.message || "An error occurred.");
        console.log("Phone Error:", error.response.data);
      } else {
        setPhoneError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setPhoneLoading(false);
    }
  };
  
  if (emailVerified && phoneVerified) {
    navigate("/login");
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">User Verification</h2>

      {/* Email OTP Form */}
      <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
        {emailError && <div className="text-red-500 text-sm mb-2">{emailError}</div>}
        <div>
          <InputLabel label="Email OTP" name="emailOTP" />
          <InputField
            name="emailOTP"
            register={register}
            validation={{ required: "Email OTP is required" }}
            error={emailErrors.emailOTP}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={emailLoading || emailVerified}
        >
          {emailLoading ? "Verifying..." : emailVerified ? "Verified" : "Verify Email OTP"}
        </button>
      </form>

      {/* Phone OTP Form */}
      <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className="space-y-4 mt-4">
        {phoneError && <div className="text-red-500 text-sm mb-2">{phoneError}</div>}
        <div>
          <InputLabel label="Phone OTP" name="phoneOTP" />
          <InputField
            name="phoneOTP"
            register={registerPhone}
            validation={{ required: "Phone OTP is required" }}
            error={phoneErrors.phoneOTP}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={phoneLoading || phoneVerified}
        >
          {phoneLoading ? "Verifying..." : phoneVerified ? "Verified" : "Verify Phone OTP"}
        </button>
      </form>
    </div>
  );
};

export default UserVerificationPage;
