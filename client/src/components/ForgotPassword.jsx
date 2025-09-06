import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setMessage("Reset link sent to your email");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-gray-500">
              Enter your email to receive a password reset link
            </p>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("sent") ? "alert-success" : "alert-error"
              } mb-6`}
            >
              {message}
            </div>
          )}

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

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="link link-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
