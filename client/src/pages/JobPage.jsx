import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { MdEmail } from "react-icons/md";

const JobPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/jobs/${jobId}`);
        setJob(response.data.data);
      } catch (err) {
        setError("Failed to fetch job details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) return <div className="text-center text-lg font-semibold mt-10">Loading job details...</div>;
  if (error) return <div className="text-center text-red-500 font-semibold mt-10">{error}</div>;

  // Calculate the remaining days
  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
  };
  const remainingDays = calculateRemainingDays(job.endDate);
  const postedDaysAgo = calculateRemainingDays(job.createdAt);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      {/* Job Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.jobTitle}</h1>

      {/* Created By */}
      <p className="text-gray-600 text-md mb-4">
        <span className="font-semibold">{job.createdBy.fullName}</span>
        <a href={`mailto:${job.createdBy.email}`} className="group"><MdEmail className="inline-block mx-1" />
          <span className="hidden group-hover:inline-block">({job.createdBy.email})</span>
        </a> 
      </p>

      {/* Experience Level */}
      <p 
        className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-md inline-block mb-4"
        title="Required experience out of BEGINEER, INTERMEDIATE, EXPERT"
      >
        <span className="border-r-1 border-blue-300">Experience Level&nbsp;&nbsp;&nbsp;</span> &nbsp; {job.experienceLevel}
      </p>

      {/* Posted dags ago */}
      <div className="flex text-sm text-slate-600">
        <p className="mb-2 inline-block border-r border-gray-300 pr-2">
          <span className="font-semibold"> Posted: </span>{postedDaysAgo} {postedDaysAgo === 1 ? "day" : "days"} ago 
        </p>
        <p className="mb-2 inline-block pl-2">
          <span className="font-semibold"> Applicants: </span>{job.candidates.length}
        </p>
      </div>

      {/* Job End Date */}
      <div className="text-sm text-slate-600">
        <strong className="font-semibold mb-2 text-gray-800">Deadline: {" "}</strong>
        <p className="inline-block">{new Date(job.endDate).toDateString()}</p>
        <span className="font-semibold">
        {" (" + remainingDays}{remainingDays === 1 ? " day" : " days"} remaining)
        </span>
      </div>

      {/* Job Description */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Job Description</h2>
        <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.jobDescription}</p>
      </div>

      {/* Candidates Section */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Candidates</h2>
        <ul className="list-disc pl-6 text-gray-700">
          {job.candidates.map((email, index) => (
            <li key={index} className="text-gray-600">{email}</li>
          ))}
        </ul>
      </div>

      
    </div>
  );
};

export default JobPage;
