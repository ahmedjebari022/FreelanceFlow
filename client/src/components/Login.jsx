import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const redirectPath = null; // Define redirectPath if needed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(redirectPath || "/");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-200">
      {/* Left side - Brand showcase */}
      <div className="flex-1 bg-primary text-primary-content p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-focus opacity-90"></div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            fill="currentColor"
          >
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle
                id="pattern-circle"
                cx="10"
                cy="10"
                r="1.6257413380501518"
              ></circle>
            </pattern>
            <rect
              id="rect"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-circles)"
            ></rect>
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">FreelanceFlow</h1>
          <p className="text-xl opacity-90">
            Your gateway to freelance success
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Access to top freelancers</h3>
                <p className="opacity-90 text-sm">
                  Find skilled professionals for your projects
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Secure payments</h3>
                <p className="opacity-90 text-sm">
                  Protected transactions for peace of mind
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Quality assurance</h3>
                <p className="opacity-90 text-sm">
                  Vetted freelancers with verified portfolios
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-80">
          © 2025 FreelanceFlow. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body p-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Welcome back</h2>
              <p className="text-base-content/60">
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-6 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-300 flex items-center px-4 rounded-l-lg border-y border-l border-base-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-base-content/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full rounded-l-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-300 flex items-center px-4 rounded-l-lg border-y border-l border-base-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-base-content/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input input-bordered w-full rounded-l-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="label cursor-pointer inline-flex items-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm mr-2"
                  />
                  <span className="label-text">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="link link-hover text-primary text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="divider my-6">OR CONTINUE WITH</div>

            <div className="grid grid-cols-1 gap-3">
              <button className="btn btn-outline gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  width="24"
                  viewBox="0 0 488 512"
                >
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    fill="currentColor"
                  />
                </svg>
                Google
              </button>
            </div>

            <p className="text-center text-base-content/70 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="link link-primary font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
