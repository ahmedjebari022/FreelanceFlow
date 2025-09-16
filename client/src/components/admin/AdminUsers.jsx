import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CreateAdminUser from "./CreateAdminUser";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/users?page=${page}&limit=10`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (roleFilter) {
        url += `&role=${roleFilter}`;
      }

      url += `&sortBy=${sortField}&order=${sortOrder}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setTotalUsers(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, roleFilter, sortField, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setImagePreview(user.profileImage || null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstName", editFormData.firstName);
      formData.append("lastName", editFormData.lastName);
      formData.append("email", editFormData.email);
      formData.append("role", editFormData.role);
      formData.append("isActive", editFormData.isActive);

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const response = await axios.put(
        `/api/admin/users/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the user in the list
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );

      setIsEditModalOpen(false);
      setSelectedUser(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user");
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`/api/admin/users/${selectedUser._id}`, {
        withCredentials: true,
      });

      // Remove the user from the list
      setUsers(users.filter((user) => user._id !== selectedUser._id));
      setTotalUsers(totalUsers - 1);

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="alert alert-error">
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
    );
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users Management</h1>
      <CreateAdminUser
        onUserCreated={(newUser) => {
          setUsers([newUser, ...users]);
          setTotalUsers(totalUsers + 1);
        }}
      />

      {/* Search and Filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="form-control flex-grow">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-square">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <select
            className="select select-bordered"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="client">Clients</option>
            <option value="freelancer">Freelancers</option>
            <option value="admin">Admins</option>
          </select>
        </form>
      </div>

      {/* User count and pagination info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {users.length} of {totalUsers} users
        </p>
        <div className="btn-group">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button className="btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="btn btn-sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("firstName")}
                >
                  Name {getSortIcon("firstName")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("email")}
                >
                  Email {getSortIcon("email")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("role")}
                >
                  Role {getSortIcon("role")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("createdAt")}
                >
                  Joined {getSortIcon("createdAt")}
                </button>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-10 h-10">
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                          alt="Avatar"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="hover:underline"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                      </div>
                      <div className="text-sm opacity-50">
                        {user._id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "admin"
                        ? "badge-secondary"
                        : user.role === "freelancer"
                        ? "badge-primary"
                        : "badge-accent"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`badge ${
                      user.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="py-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="input input-bordered"
                  value={editFormData.firstName}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="input input-bordered"
                  value={editFormData.lastName}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Active Status</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    className="toggle toggle-primary"
                    checked={editFormData.isActive}
                    onChange={handleEditFormChange}
                  />
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Profile Image</span>
                </label>

                {imagePreview && (
                  <div className="avatar mb-2">
                    <div className="w-24 rounded-full">
                      <img src={imagePreview} alt="Profile Preview" />
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete user{" "}
              <span className="font-semibold">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteSubmit}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
