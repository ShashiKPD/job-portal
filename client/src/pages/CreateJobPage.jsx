import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "../context/AuthContext.jsx"; 

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const { user } = useAuth();
  if (!user) {
    enqueueSnackbar("Please login to create a job", { variant: "error" });
    navigate("/login");
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      experienceLevel: "",
      candidates: [{ email: "" }],
      endDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "candidates",
  });

  const onSubmit = async (data) => {
    if (data.endDate) {
      data.endDate = new Date(data.endDate).toISOString();
    }

    try {
      const response = await axios.post("/jobs/create", data, { withCredentials: true });
      console.log("Job created successfully:", response.data);
      enqueueSnackbar("Job created successfully", { variant: "success" });
      sleep(1000).then(() => navigate(`/company/${user.username}`));
    } catch (error) {
      console.error("Error creating job:", error?.response?.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Job</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-gray-700 font-medium">Job Title</label>
            <input
              type="text"
              {...register("jobTitle", {
                required: "Job title is required",
                maxLength: { value: 100, message: "Max 100 characters" },
              })}
              className="mt-1 p-2 w-full border rounded-lg focus:ring focus:ring-blue-300"
            />
            {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-700 font-medium">Job Description</label>
            <textarea
              {...register("jobDescription", {
                required: "Job description is required",
                maxLength: { value: 1000, message: "Max 1000 characters" },
              })}
              className="mt-1 p-2 w-full border rounded-lg focus:ring focus:ring-blue-300"
              rows="4"
            />
            {errors.jobDescription && (
              <p className="text-red-500 text-sm">{errors.jobDescription.message}</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-gray-700 font-medium">Experience Level</label>
            <select
              {...register("experienceLevel", {
                required: "Experience level is required",
                validate: (value) =>
                  ["BEGINNER", "INTERMEDIATE", "EXPERT"].includes(value) || "Invalid experience level",
              })}
              className="mt-1 p-2 w-full border rounded-lg focus:ring focus:ring-blue-300"
            >
              <option value="">Select Experience Level</option>
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="EXPERT">EXPERT</option>
            </select>
            {errors.experienceLevel && (
              <p className="text-red-500 text-sm">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Candidate Emails */}
          <div>
            <label className="block text-gray-700 font-medium">Candidate Emails</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2 mt-2">
                <input
                  type="email"
                  placeholder="Candidate Email"
                  {...register(`candidates.${index}.email`, {
                    required: "Email is required",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message: "Invalid email",
                    },
                  })}
                  className="p-2 flex-1 border rounded-lg focus:ring focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
            {errors.candidates?.map((error, index) => (
              error.email && <p key={index} className="text-red-500 text-sm">{error.email.message}</p>
            ))}
            <button
              type="button"
              onClick={() => append({ email: "" })}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              + Add Candidate
            </button>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-gray-700 font-medium">End Date</label>
            <input
              type="date"
              {...register("endDate", { required: "End date is required" })}
              className="mt-1 p-2 w-full border rounded-lg focus:ring focus:ring-blue-300"
            />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
