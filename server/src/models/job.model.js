import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    experienceLevel: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "EXPERT"],
      required: [true, "Experience level is required"],
    },
    candidates: [
      {
        email: {
          type: String,
          required: [true, "Candidate email is required"],
          match: [/.+@.+\..+/, "Please provide a valid email address"],
        },
        status: {
          type: String,
          enum: ["PENDING", "SENT", "FAILED"],
          default: "PENDING",
        },
      },
    ],
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the authenticated company
      required: [true, "Job must be associated with a company"],
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
