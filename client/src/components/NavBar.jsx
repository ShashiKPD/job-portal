import { RxHamburgerMenu } from "react-icons/rx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { useSnackbar } from "notistack";

const NavBar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar()
  const location = useLocation();

  const handleLogout = async () => {
    // Remove auth and refresh tokens stored as HTTP-Only cookies
    // document.cookie = 'authToken=; Max-Age=0; path=/; domain=' + window.location.hostname;
    // document.cookie = 'refreshToken=; Max-Age=0; path=/; domain=' + window.location.hostname;

    try {
      await axios.post("/users/logout", {}, { withCredentials: true });
      setUser(null); // Clear AuthContext
    } catch (error) {
      console.error("Logout failed:", error);
      enqueueSnackbar("Logout failed. Please try again.", { variant: "error" });
    }
  };

  return (
    <nav className="w-full bg-slate-800 text-white">
      <div className="flex justify-left mx-auto">
        <div className="flex gap-5 items-center p-5">
          <a className="navbar-brand" href="/">KaamKaaj</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <RxHamburgerMenu className="text-2xl" />
          </button>
        </div>
        <div className="navbar-collapse flex justify-end w-full" id="navbarNav">
          {!user ? (
            <div className="flex items-center text-center">
              {!(location.pathname === "/login") &&
                <Link className="nav-link p-5 hover:bg-slate-600" to="/login">Login</Link>
              }
              {!(location.pathname === "/register") &&
                <Link className="nav-link p-5 hover:bg-slate-600" to="/register">Register</Link>
              }
            </div>
          ) : (
            <div className="flex items-center text-center">
              <Link className="nav-link p-5 hover:bg-slate-600" to="/profile">Profile</Link>
              <button className="nav-link p-5 hover:bg-slate-600" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;