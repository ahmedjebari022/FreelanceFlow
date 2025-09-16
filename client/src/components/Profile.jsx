import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await axios.put("/api/auth/profile", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the user in context
      setUser(response.data.user);
      setMessage("Your profile has been updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.put(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setMessage("Your password has been changed successfully!");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-warning shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Authentication Required</h3>
              <div className="text-xs">Please login to view your profile</div>
            </div>
          </div>
          <div className="flex-none">
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar online">
                  <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=256&background=random`
                      }
                      alt="Profile"
                    />
                  </div>
                </div>
                <h2 className="card-title text-2xl mt-4">
                  {firstName} {lastName}
                </h2>
                <div className="badge badge-primary badge-lg mt-1">
                  {user.role}
                </div>
                <p className="text-sm text-gray-500 mt-2">{email}</p>

                <div className="divider"></div>

                <div className="stats stats-vertical shadow w-full">
                  <div className="stat">
                    <div className="stat-title">Member Since</div>
                    <div className="stat-value text-lg">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {user.role === "freelancer" && (
                    <div className="stat">
                      <div className="stat-title">Payment Account</div>
                      <div className="stat-value text-lg">
                        {user.stripeConnectId ? (
                          <span className="text-success">Connected</span>
                        ) : (
                          <span className="text-error">Not Connected</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions w-full mt-6">
                  <button
                    onClick={logout}
                    className="btn btn-outline btn-error w-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {user.role === "freelancer" && (
              <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Payment Settings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set up your payment account to receive payments from
                    clients.
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      to="/payment-setup"
                      className="btn btn-primary w-full"
                    >
                      {user.stripeConnectId
                        ? "Manage Payment Account"
                        : "Set Up Payment Account"}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="tabs tabs-lifted mb-6">
                  <button
                    className={`tab tab-lg tab-bordered ${
                      activeTab === "profile" ? "tab-active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("profile");
                      setMessage("");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile Information
                  </button>
                  <button
                    className={`tab tab-lg tab-bordered ${
                      activeTab === "password" ? "tab-active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("password");
                      setMessage("");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Change Password
                  </button>
                </div>

                {message && (
                  <div
                    className={`alert ${
                      messageType === "success"
                        ? "alert-success"
                        : "alert-error"
                    } mb-6 shadow-lg`}
                  >
                    <div>
                      {messageType === "success" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current flex-shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current flex-shrink-0 h-6 w-6"
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
                      )}
                      <span>{message}</span>
                    </div>
                    <div className="flex-none">
                      <button
                        onClick={() => setMessage("")}
                        className="btn btn-sm btn-ghost"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "profile" ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Profile Image
                        </span>
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-16 rounded-full">
                            <img
                              src={
                                imagePreview ||
                                `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=64&background=random`
                              }
                              alt="Profile Preview"
                            />
                          </div>
                        </div>
                        <input
                          type="file"
                          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      <label className="label">
                        <span className="label-text-alt text-gray-500">
                          Upload a square image for best results
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            First Name
                          </span>
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

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Last Name
                          </span>
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
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Email address
                        </span>
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

                    <div className="form-control mt-6">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                              />
                            </svg>
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Current Password
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        className="input input-bordered w-full"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          New Password
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your new password"
                        className="input input-bordered w-full"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-500">
                          Password must be at least 6 characters
                        </span>
                      </label>
                    </div>

                    <div className="form-control mt-6">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner"></span>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
