import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js";
import InputField from "../components/InputField";
import InputLabel from "../components/InputLabel";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

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

      console.log("Login Successful:", response.data);

      // Redirect to the home page after login
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || "Invalid credentials.");
        console.log("Login Error:", error.response.data);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
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
    </div>
  );
};

export default LoginPage;
