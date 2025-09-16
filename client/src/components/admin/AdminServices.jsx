import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedService, setSelectedService] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusChangeReason, setStatusChangeReason] = useState("");

  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/services?page=${page}&limit=10`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }

      url += `&sortBy=${sortField}&order=${sortOrder}`;

      const response = await axios.get(url);

      setServices(response.data.services);
      setTotalPages(response.data.pagination.pages);
      setTotalServices(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchServices(currentPage);
    fetchCategories();
  }, [currentPage, statusFilter, categoryFilter, sortField, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChangeClick = (service, status) => {
    setSelectedService(service);
    setNewStatus(status);
    setStatusChangeReason("");
    setIsStatusChangeModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`/api/admin/services/${selectedService._id}`);

      setServices(
        services.filter((service) => service._id !== selectedService._id)
      );
      setTotalServices(totalServices - 1);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Failed to delete service");
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.patch(
        `/api/admin/services/${selectedService._id}/status`,
        {
          status: newStatus,
          reason: statusChangeReason,
        }
      );

      setServices(
        services.map((service) =>
          service._id === selectedService._id ? response.data : service
        )
      );
      setIsStatusChangeModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error("Error updating service status:", err);
      setError("Failed to update service status");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
      case "rejected":
        return <span className="badge badge-error">Rejected</span>;
      case "inactive":
        return <span className="badge badge-ghost">Inactive</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Services Management</h1>

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
                placeholder="Search by title or description..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="select select-bordered"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
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

      {/* Service count and pagination info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {services.length} of {totalServices} services
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

      {/* Services Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("title")}
                >
                  Service {getSortIcon("title")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("freelancer")}
                >
                  Freelancer {getSortIcon("freelancer")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("category")}
                >
                  Category {getSortIcon("category")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("price")}
                >
                  Price {getSortIcon("price")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("status")}
                >
                  Status {getSortIcon("status")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("createdAt")}
                >
                  Created {getSortIcon("createdAt")}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-10 h-10">
                        <img
                          src={
                            service.images && service.images.length > 0
                              ? service.images[0].url
                              : `https://via.placeholder.com/100?text=${service.title.charAt(
                                  0
                                )}`
                          }
                          alt={service.title}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">
                        <Link
                          to={`/admin/services/${service._id}`}
                          className="hover:underline"
                        >
                          {service.title}
                        </Link>
                      </div>
                      <div className="text-sm opacity-50">
                        {service._id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {service.freelancer ? (
                    <Link
                      to={`/admin/users/${service.freelancer._id}`}
                      className="hover:underline"
                    >
                      {service.freelancer.firstName}{" "}
                      {service.freelancer.lastName}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{service.category ? service.category.name : "N/A"}</td>
                <td>{formatCurrency(service.price)}</td>
                <td>{getStatusBadge(service.status)}</td>
                <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                <td className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/services/${service._id}`}
                      className="btn btn-xs btn-outline"
                    >
                      View
                    </Link>
                    <button
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => handleDeleteClick(service)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {service.status === "pending" && (
                      <>
                        <button
                          className="btn btn-xs btn-outline btn-success"
                          onClick={() =>
                            handleStatusChangeClick(service, "active")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-xs btn-outline btn-error"
                          onClick={() =>
                            handleStatusChangeClick(service, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {service.status === "active" && (
                      <button
                        className="btn btn-xs btn-outline btn-warning"
                        onClick={() =>
                          handleStatusChangeClick(service, "inactive")
                        }
                      >
                        Deactivate
                      </button>
                    )}
                    {service.status === "inactive" && (
                      <button
                        className="btn btn-xs btn-outline btn-success"
                        onClick={() =>
                          handleStatusChangeClick(service, "active")
                        }
                      >
                        Activate
                      </button>
                    )}
                    {service.status === "rejected" && (
                      <button
                        className="btn btn-xs btn-outline btn-success"
                        onClick={() =>
                          handleStatusChangeClick(service, "active")
                        }
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {services.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-xl font-semibold mb-2">No services found</div>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete the service "
              {selectedService?.title}"? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedService(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteSubmit}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusChangeModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Service Status</h3>
            <p className="py-4">
              Are you sure you want to change the status of "
              {selectedService?.title}" to {newStatus}?
              {(newStatus === "rejected" || newStatus === "inactive") &&
                " Please provide a reason for this action."}
            </p>

            {(newStatus === "rejected" || newStatus === "inactive") && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Enter the reason for this action"
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  required={newStatus === "rejected"}
                ></textarea>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setIsStatusChangeModalOpen(false);
                  setSelectedService(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  newStatus === "active"
                    ? "btn-success"
                    : newStatus === "rejected"
                    ? "btn-error"
                    : "btn-warning"
                }`}
                onClick={handleStatusChange}
                disabled={
                  (newStatus === "rejected" || newStatus === "inactive") &&
                  !statusChangeReason
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
