import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">Change Password</h2>
            <p className="text-gray-500">Enter your current and new password</p>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("successfully")
                  ? "alert-success"
                  : "alert-error"
              } mb-6`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Current Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                className="input input-bordered w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                "Change Password"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/profile" className="link link-primary">
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
