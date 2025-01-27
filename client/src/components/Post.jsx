import { Link } from "react-router-dom";

const Post = ({ job }) => {
  const { jobTitle, jobDescription, experienceLevel, endDate, createdBy } = job;
  const { fullName, email, username } = createdBy;

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
      <h3 className="text-xl font-semibold text-slate-700">{jobTitle}</h3>
      <p className="text-sm text-slate-500 mb-3">{jobDescription}</p>
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
      <div className="text-sm text-slate-500 mb-3">
        <strong>Posted by: </strong>
        <Link
          to={`/company/${username}`}
          className="text-slate-600 hover:text-slate-800 font-semibold"
        >
          {fullName}
        </Link>{" "}
        <span className="ml-2">
          (<a href={`mailto:${email}`} className="text-slate-600 hover:text-slate-800">{email}</a>)
        </span>
      </div>
    </div>
  );
};


export default Post;
