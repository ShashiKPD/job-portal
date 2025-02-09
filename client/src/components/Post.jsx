import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Post = ({ job }) => {
  const { jobTitle, jobDescription, experienceLevel, endDate, createdBy } = job;
  const { fullName, email, username } = createdBy;
  const location = useLocation();
  const { user } = useAuth();
  const onOwnerProfilePage = location.pathname.includes(`/company/${user?.username}`); // Check if the user is on their profile page or not

  const experienceLevelStyles = {
    BEGINNER: "bg-green-200 text-green-800",
    INTERMEDIATE: "bg-yellow-200 text-yellow-800",
    EXPERT: "bg-red-200 text-red-800",
  };

  // Calculate the remaining days
  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
  };
  const remainingDays = calculateRemainingDays(endDate);

  return (
    <div className="border border-gray-300 rounded-lg shadow-md p-6 mb-4 bg-slate-100">
      <div className="flex justify-between ">
        <div>
          <h3 className="text-xl font-semibold text-slate-700">{jobTitle}</h3>
          <p className="text-sm text-slate-500 mb-3">{jobDescription}</p>
        </div>
        {onOwnerProfilePage && (
        <Link
          to={`/company/${username}/job/${job._id}`}
          className="shrink-0 max-sm:text-xs text-white bg-indigo-400 rounded-lg pl-2 pr-2 flex items-center hover:bg-indigo-500 font-semibold max-h-10"
        >
          View Job
        </Link>
      )}
      </div>
      <div className="flex items-center mb-3">
        <span
          className={`text-xs font-medium py-1 px-3 rounded-full ${experienceLevelStyles[experienceLevel]}`}
        >
          {experienceLevel}
        </span>
      </div>
      <div className="text-sm text-slate-500 mb-3">
        <strong>End Date:</strong> {new Date(endDate).toLocaleDateString()}{" "}
        <span className="text-slate-600 font-semibold">
          ({remainingDays} {remainingDays === 1 ? "day" : "days"} remaining)
        </span>
      </div>
      {!onOwnerProfilePage && (
        <div className="text-sm text-slate-500 mb-3">
          <strong>Posted by: </strong>
          <Link
            to={`/company/${username}`}
            className="text-slate-500 hover:text-slate-900 font-semibold"
          >
            {fullName}
          </Link>{" "}
          <span className="ml-2">
            (<a href={`mailto:${email}`} className="text-slate-500 hover:text-slate-900">{email}</a>)
          </span>
        </div>
      )}
    </div>
  );
};


export default Post;
