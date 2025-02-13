import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios.js";
import InputField from "../components/InputField";
import InputLabel from "../components/InputLabel";
import { useAuth } from "../context/AuthContext.jsx";
import { useSnackbar } from "notistack";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { user, setUser } = useAuth(); 
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
  if (user) {
    navigate("/"); // Redirect to the home page if the user is already logged in
  }
  }, [user]);

  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      setServerError("");

      // API call to send OTP to the user
      await axios.post("/users/regenerate-otp",  {email: localStorage.getItem("email")}).then(()=>{
        console.log("Email OTP Sent");
        enqueueSnackbar("Email OTP sent. Please Verify", { variant: "success" });
      })
    }catch(error){
      setServerError("Error sending email OTP: " + error.response.data);
    }finally {
      setLoading(false);
    }
  }

  const sendPhoneOTP = async () => {
    try {
      setLoading(true);
      setServerError("");

      // API call to send OTP to the user
      await axios.post("/users/regenerate-otp",  {email: localStorage.getItem("phone")}).then(()=>{
        console.log("Phone OTP Sent");
        enqueueSnackbar("Phone OTP sent. Please Verify", { variant: "success" });
      })
    }catch(error){
      setServerError("Error sending phone OTP: " + error.response.data);
    }finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      // API call to log in the user
      const response = await axios.post(
        "/users/login",
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true, // Ensure cookies are included in the request
        }
      );
      console.log("Login Successful:", response.data.data.user);
      
      setUser(response.data.data.user);
      // Redirect to the home page after login
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || "Invalid credentials.");
        // If Account not verified, send otp and redirect to OTP verification page
        if(error.response.data.message === "Account not verified. Please verify your email and phone.") {
          localStorage.setItem("email", error.response.data.data.email);
          localStorage.setItem("phone", error.response.data.data.phone);
          localStorage.setItem("emailVerified", error.response.data.data.emailVerified);
          localStorage.setItem("phoneVerified", error.response.data.data.phoneVerified);
          if(!(error.response.data.data.emailVerified)) sendEmailOTP();
          if(!(error.response.data.data.emailVerified)) sendPhoneOTP();
          enqueueSnackbar("Account not verified. Please verify your email and phone.", { variant: "error" });
          navigate("/register/verify-otp");
        }
      } else {
        setServerError("An unexpected error occurred. Please try again.: ");
        console.log("Login Error:", error);
        
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {serverError && <div className="text-red-500 text-sm mb-4">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <InputLabel label="Email" name="email" />
          <InputField
            name="email"
            register={register}
            validation={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address",
              },
            }}
            error={errors.email}
          />
        </div>

        <div>
          <InputLabel label="Password" name="password" />
          <InputField
            name="password"
            type="password"
            register={register}
            validation={{ required: "Password is required" }}
            error={errors.password}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div>
        <p className="mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
