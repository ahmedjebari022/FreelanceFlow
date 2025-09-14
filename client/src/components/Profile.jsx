import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'password'

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        "/api/auth/profile",
        { firstName, lastName, email },
        { withCredentials: true }
      );
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-warning">
          Please login to view your profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <p className="text-gray-500">Manage your account information</p>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Information
            </button>
            <button
              className={`tab ${activeTab === "password" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
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

          {activeTab === "profile" ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="input input-bordered w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="input input-bordered w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

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
                  "Update Profile"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Current Password
                  </span>
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
          )}

          {user.role === "freelancer" && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-xl">Payment Settings</h2>
                <p className="mb-4">
                  Set up your payment account to receive payments from clients.
                </p>
                <div className="card-actions">
                  <Link to="/payment-setup" className="btn btn-primary">
                    Manage Payment Account
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="divider my-6"></div>

          <button onClick={logout} className="btn btn-outline btn-error w-full">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
