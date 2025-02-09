import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios.js";
import {Post} from "../components";
import { useAuth } from "../context/AuthContext.jsx"; 

const CompanyPage = () => {
  const { companyUsername } = useParams(); 
  const [companyData, setCompanyData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);

        // Fetch company job postings from the backend
        const response = await axios.get(`/jobs/company/${companyUsername}?page=1&limit=10`);
        
        setCompanyData(response.data.data.jobs[0].createdBy); // Assuming company data is in createdBy
        setJobs(response.data.data.jobs);
        setPagination(response.data.data.pagination);

      } catch (error) {
        console.error("Error fetching company data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyUsername]);

  const handlePageChange = async (page) => {
    try {
      setLoading(true);

      const response = await axios.get(`/jobs/company/${companyUsername}?page=${page}&limit=1`);
      setJobs(response.data.data.jobs);
      setPagination(response.data.data.pagination);
      
    } catch (error) {
      console.error("Error fetching jobs for this page", error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUserCompany = user && user?.username === companyUsername;

  return (
    <div className="container mx-auto p-6">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {/* Company Details */}
          <div className="border-b border-gray-300 pb-6 mb-6">
            <h2 className="text-3xl font-bold text-slate-800">{companyData?.fullName}</h2>
            <p className="text-lg text-slate-600">{companyData?.email}</p>
          </div>

          {/* Post Button (only visible to the company's owner) */}
          {isCurrentUserCompany && (
            <button
              onClick={() => navigate("/job-listing")}
              className="mb-6 py-2 px-4 bg-indigo-400 font-semibold text-white rounded-lg hover:bg-indigo-600 cursor-pointer border-indigo-200 border-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Create Job Post
            </button>
          )}

          {/* Job Posts */}
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Post key={job._id} job={job} />
              ))
            ) : (
              <div className="text-center text-slate-500">No job posts available for this company.</div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-l-lg hover:bg-gray-300"
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-800">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300"
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
