import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">FreelanceFlow</h1>
          <p className="py-6">
            Connect with top talent and clients. Your gateway to successful
            freelancing and project completion.
          </p>

          {!user ? (
            <div className="space-x-4">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Learn More
              </Link>
            </div>
          ) : user.role === "client" ? (
            <div className="space-y-4">
              <h2 className="text-2xl">Welcome, {user.firstName}!</h2>
              <Link to="/post-project" className="btn btn-primary">
                Post a Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl">Welcome, {user.firstName}!</h2>
              <Link to="/projects" className="btn btn-primary">
                Find Projects
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
