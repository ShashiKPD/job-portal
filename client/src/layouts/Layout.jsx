import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";

const Layout = () => {

  return (
    <>
    <NavBar />
    <Outlet /> 
    </>
)};

export default Layout;
