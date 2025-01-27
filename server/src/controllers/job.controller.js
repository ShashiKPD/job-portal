import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";


const createJob = asyncHandler(async (req, res) => {
  const { jobTitle, jobDescription, experienceLevel, candidates, endDate } = req.body;

  if ([jobTitle, jobDescription, experienceLevel, endDate].some((field) => field?.trim() === "" || !field)) {
    throw new ApiError(400, "All fields are required");
  }
  const ExperienceLevel = {
    BEGINNER: "BEGINNER",
    INTERMEDIATE: "INTERMEDIATE",
    EXPERT: "EXPERT",
  };

  if (!Object.values(ExperienceLevel).includes(experienceLevel)) {
    throw new ApiError(400, "Invalid experience level");
  }
  if(!Array.isArray(candidates)) {
    throw new ApiError(400, "Candidates must be an array");
  }

  candidates.forEach((candidate) => {
    if (!candidate?.email || !candidate.email.trim() || !/.+@.+\..+/.test(candidate.email)) {
      throw new ApiError(400, `Invalid email: ${candidate.email}`);
    }
  });

  if (new Date(endDate) < new Date()) {
    throw new ApiError(400, "End date must be in the future");
  }

  candidates.forEach((candidate) => {
    candidate.status = "PENDING";
  });
  
  const job = await Job.create({
    jobTitle,
    jobDescription,
    experienceLevel,
    candidates,
    endDate,
    createdBy: req.user._id,
  })

  if (!job) {
    throw new ApiError(500, "Job creation failed");
  }

  const createdJob = await Job.findById(job._id)
  .populate('createdBy', 'username email fullName -_id') 
  .select('-createdAt -updatedAt -__v');

  createdJob.endDate = new Date(createdJob.endDate).toISOString();

  return res.status(201).json(new ApiResponse(201, createdJob, "Job created successfully"));
});

const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 jobs per page
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const jobs = await Job.find()
  .skip(skip) 
  .limit(parseInt(limit)) 
  .sort({ createdAt: -1 }) // Sort jobs by most recent
  .select('-createdAt -updatedAt -__v')
  .populate('createdBy', 'username email fullName -_id');
  
  const totalJobs = await Job.countDocuments();
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          limit: parseInt(limit),
        },
      },
      "Jobs fetched successfully"
    )
  );
});

const getJobsByCompany = asyncHandler(async (req, res) => {
  const { username } = req.params; // Company username 
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Find the company (user) by username
  const company = await User.findOne({ username }).select('_id username email fullName');

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const totalJobs = await Job.countDocuments({ createdBy: company._id });
  const jobs = await Job.find({ createdBy: company._id })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt -__v') // Exclude unnecessary fields
    .populate('createdBy', 'username email fullName -_id'); // Include user details in `createdBy`

  if (!jobs.length) {
    throw new ApiError(404, "No jobs found for this company");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          limit: parseInt(limit),
        },
      },
      "Jobs retrieved successfully for the company"
    )
  );
});

const addOrRemoveCandidate = asyncHandler(async (req, res) => {
  const { jobId } = req.params; // Job ID from the route params
  const { email, action } = req.body; // Action to add or remove candidate email

  // Validate input fields
  if (!email || !/.+@.+\..+/.test(email)) {
    throw new ApiError(400, "Invalid candidate email");
  }
  
  if (action !== 'add' && action !== 'remove') {
    throw new ApiError(400, "Action must be either 'add' or 'remove'");
  }

  // Find the job by jobId
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // Check if the logged-in user is the company that created the job
  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this job");
  }

  // Check if action is "add" or "remove"
  if (action === 'add') {
    // Check if the candidate email already exists in the job's candidates array
    const candidateExists = job.candidates.some(candidate => candidate.email === email);
    if (candidateExists) {
      throw new ApiError(400, "Candidate with this email is already added to this job");
    }

    // Add the candidate to the candidates array
    job.candidates.push({ email, status: 'PENDING' });
  } else if (action === 'remove') {
    // Find the index of the candidate in the candidates array
    const candidateIndex = job.candidates.findIndex(candidate => candidate.email === email);
    
    if (candidateIndex === -1) {
      throw new ApiError(404, "Candidate not found in this job listing");
    }

    // Remove the candidate from the candidates array
    job.candidates.splice(candidateIndex, 1);
  }

  // Save the updated job listing
  await job.save();

  // Return the updated job listing
  const updatedJob = await Job.findById(job._id)
    .populate('createdBy', 'username email fullName -_id') // Populating createdBy field
    .select('-createdAt -updatedAt -__v');

  return res.status(200).json(
    new ApiResponse(200, updatedJob, `Candidate ${action}ed successfully`)
  );
});


export { createJob, getAllJobs, getJobsByCompany, addOrRemoveCandidate };