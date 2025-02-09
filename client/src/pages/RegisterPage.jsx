// src/pages/CompanyRegisterPage.jsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios.js";
import InputField from "../components/InputField";
import InputLabel from "../components/InputLabel";
import { useAuth } from "../context/AuthContext.jsx";


const CompanyRegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(""); // State to store server error messages
  const navigate = useNavigate();
  const { user } = useAuth(); 


  useEffect(() => {
  if (user) {
    navigate("/"); // Redirect to the home page if the user is already logged in
  }
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError(""); // Clear previous server error

      // Send the form data to your backend to register the company
      const response = await axios.post("/users/register", data);
      console.log("Company Registered:", response.data);

      localStorage.setItem("email", data.email);
      localStorage.setItem("phone", data.phone);

      navigate("/register/verify-otp"); 

    } catch (error) {
      // Handle server errors
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || "An error occurred while registering."); // Display the server error message
        console.log("Server Error:", error.response.data);
      } else {
        setServerError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl ">
      <h2 className="text-2xl font-bold mb-4">Company Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Display server error */}
        {serverError && <div className="text-red-500 text-sm mb-4">{serverError}</div>}

        <div>
          <InputLabel label="Username" name="username" />
          <InputField
            name="username"
            register={register}
            validation={{ required: "Username is required" }}
            error={errors.username}
          />
          {/* {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>} */}
        </div>

        <div>
          <InputLabel label="Email" name="email" />
          <InputField
            name="email"
            type="email"
            register={register}
            validation={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email"
              }
            }}
            error={errors.email}
          />
          {/* {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>} */}
        </div>

        <div>
          <InputLabel label="Phone" name="phone" />
          <InputField
            name="phone"
            register={register}
            validation={{
              required: "Phone number is required",
              pattern: {
                value: /^\+\d{1,4}\d{10}$/,
                message: "Please enter a valid phone number (Include country code. e.g. +1234567890)"
              }
            }}
            error={errors.phone}
          />
          {/* {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>} */}
        </div>

        <div>
          <InputLabel label="Full Name" name="fullName" />
          <InputField
            name="fullName"
            register={register}
            validation={{ required: "Full name is required" }}
            error={errors.fullName}
          />
          {/* {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>} */}
        </div>

        <div>
          <InputLabel label="Password" name="password" />
          <InputField
            name="password"
            type="password"
            register={register}
            validation={{
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            }}
            error={errors.password}
          />
          {/* {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>} */}
        </div>

        <button type="submit" className="w-full py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300" disabled={loading}>
          {loading ? "Submitting..." : "Register Company"}
        </button>
      </form>
      <div>
        <p className="mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CompanyRegisterPage;
