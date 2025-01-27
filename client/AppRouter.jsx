import { Routes, Route } from "react-router-dom";

const Home = () => <h1 className="text-4xl text-center mt-10">Welcome to the Job Portal</h1>;
const NotFound = () => <h1 className="text-4xl text-center mt-10">404 - Page Not Found</h1>;

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
