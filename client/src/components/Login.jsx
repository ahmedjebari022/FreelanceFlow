import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      login(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-500">Please enter your details</p>
          </div>

          {error && <div className="alert alert-error mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email address</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                />
                <span className="label-text">Remember for 30 days</span>
              </label>
              <Link to="/forgot-password" className="link link-primary text-sm">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="divider my-6">OR</div>

          <button className="btn btn-outline w-full mb-6">
            <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>

          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
