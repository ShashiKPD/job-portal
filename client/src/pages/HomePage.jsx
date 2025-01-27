import { useState, useEffect } from "react";
import axios from "../api/axios"; // Assumes you have a custom axios instance
import Post from "../components/Post"; // The Post component you'll create later

const HomePage = () => {
  const [jobs, setJobs] = useState([]); // Stores the job data
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Fetch job data
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`/jobs/?page=${page}&limit=10`);
      const { jobs, pagination } = response.data.data;

      setJobs(jobs);
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs on component mount and when currentPage changes
  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">Job Openings</h1>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Post key={job._id} job={job} /> // Pass each job to the Post component
            ))
          ) : (
            <p>No jobs available at the moment.</p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading}
          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;
