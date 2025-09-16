import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMyServices = async () => {
      try {
        const response = await axios.get("/api/services/my-services", {
          withCredentials: true,
        });
        setServices(response.data);
      } catch (err) {
        setError("Failed to fetch your services.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyServices();
    }
  }, [user]);

  const handleUpdateService = async (serviceData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/services/${editingService._id}`,
        serviceData,
        { withCredentials: true }
      );
      setServices(
        services.map((s) => (s._id === editingService._id ? response.data : s))
      );
      setEditingService(null);
    } catch (err) {
      console.error("Error updating service:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/services/${deletingService._id}`, {
        withCredentials: true,
      });
      setServices(services.filter((s) => s._id !== deletingService._id));
      setDeletingService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search term and status filter
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && service.isActive) ||
      (filterStatus === "inactive" && !service.isActive);

    return matchesSearch && matchesStatus;
  });

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading your services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="alert alert-error max-w-md">
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
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="text-primary font-medium">My Services</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Header Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Services</h1>
                <p className="text-base-content/70 mt-1">
                  Manage and edit your professional offerings
                </p>
              </div>
              <Link to="/services/create" className="btn btn-primary">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Service
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="form-control w-full md:w-1/2">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search your services..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square">
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
              <div className="flex gap-2">
                <div className="join">
                  <button
                    className={`btn join-item ${
                      filterStatus === "all" ? "btn-active" : ""
                    }`}
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn join-item ${
                      filterStatus === "active" ? "btn-active" : ""
                    }`}
                    onClick={() => setFilterStatus("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`btn join-item ${
                      filterStatus === "inactive" ? "btn-active" : ""
                    }`}
                    onClick={() => setFilterStatus("inactive")}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingService && (
          <EditServiceModal
            service={editingService}
            onUpdate={handleUpdateService}
            onCancel={() => setEditingService(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingService && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-xl mb-4">Confirm Deletion</h3>
              <p className="py-2">
                Are you sure you want to delete "
                <span className="font-semibold">{deletingService.title}</span>"?
              </p>
              <p className="text-error text-sm mb-4">
                This action cannot be undone.
              </p>
              <div className="modal-action">
                <button
                  onClick={() => setDeletingService(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteService}
                  className="btn btn-error"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Service"
                  )}
                </button>
              </div>
            </div>
            <label
              className="modal-backdrop"
              onClick={() => setDeletingService(null)}
            ></label>
          </div>
        )}

        {/* Services Display */}
        {services.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <div className="text-6xl text-base-content/20 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="card-title text-2xl mb-2">No Services Found</h2>
              <p className="text-base-content/70 mb-6">
                You haven't created any services yet. Create your first service
                to start offering your skills to clients.
              </p>
              <Link to="/services/create" className="btn btn-primary btn-wide">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Service
              </Link>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-12">
              <div className="text-6xl text-base-content/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
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
              </div>
              <h2 className="card-title text-xl mb-2">No Matching Services</h2>
              <p className="text-base-content/70 mb-4">
                No services match your current search and filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="card-body p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Service Image */}
                    <div className="w-full md:w-1/3 h-auto md:h-full bg-base-200">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0].url}
                          alt={service.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full flex items-center justify-center bg-base-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-base-content/30"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Service Info */}
                    <div className="w-full md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="card-title">{service.title}</h2>
                        <div className="dropdown dropdown-end">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-sm btn-circle"
                          >
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
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <li>
                              <Link to={`/services/${service._id}`}>
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View Service
                              </Link>
                            </li>
                            <li>
                              <button
                                onClick={() => setEditingService(service)}
                              >
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit Service
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setDeletingService(service)}
                                className="text-error"
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete Service
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`badge ${
                            service.isActive ? "badge-success" : "badge-error"
                          }`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                        {service.category && (
                          <span className="badge badge-ghost">
                            {service.category.name}
                          </span>
                        )}
                        <span className="badge badge-primary badge-outline">
                          ${service.price}
                        </span>
                      </div>

                      <p className="text-sm text-base-content/70 line-clamp-2 mb-4">
                        {service.description}
                      </p>

                      <div className="flex flex-wrap text-xs text-base-content/60 gap-x-4 gap-y-1 mb-4">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {service.deliveryTime} day
                          {service.deliveryTime !== 1 ? "s" : ""} delivery
                        </div>

                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          {service.revisions} revision
                          {service.revisions !== 1 ? "s" : ""}
                        </div>

                        {service.orders && (
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            {service.orders} order
                            {service.orders !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div className="card-actions justify-end mt-auto">
                        <Link
                          to={`/services/${service._id}`}
                          className="btn btn-sm btn-outline"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => setEditingService(service)}
                          className="btn btn-sm btn-primary"
                        >
                          Edit Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EditServiceModal = ({ service, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: service.title,
    description: service.description,
    price: service.price,
    features: service.features || ["", "", ""],
    requirements: service.requirements || "",
    deliveryTime: service.deliveryTime || 7,
    revisions: service.revisions || 3,
    isActive: service.isActive,
  });
  const [loading, setLoading] = useState(false);

  // Handle feature updates
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Add more feature fields
  const addFeatureField = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  // Remove a feature field
  const removeFeatureField = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onUpdate(formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl relative">
        <h3 className="text-2xl font-bold mb-6">Edit Service</h3>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onCancel}
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Service Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
              <span className="label-text-alt">
                Describe your service in detail
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-[120px]"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Service Status</span>
            </label>
            <div className="bg-base-200 p-4 rounded-lg">
              <label className="cursor-pointer label justify-start gap-4">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span className="label-text">
                  {formData.isActive
                    ? "Active (Visible to clients)"
                    : "Inactive (Hidden from clients)"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Features</span>
              <span className="label-text-alt">What you'll provide</span>
            </label>
            <div className="bg-base-200 p-4 rounded-lg">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-primary text-primary-content rounded-full shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => removeFeatureField(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm mt-2"
                onClick={addFeatureField}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Feature
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Requirements</span>
              <span className="label-text-alt">What you need from clients</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-[80px]"
              placeholder="Information you'll need from the client"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Price ($)</span>
              </label>
              <div className="input-group">
                <span className="bg-base-300 flex items-center px-4 border-y border-l border-base-300 rounded-l-lg">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input input-bordered w-full rounded-l-none"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Delivery Time</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="input input-bordered w-full rounded-r-none"
                  min="1"
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryTime: e.target.value })
                  }
                  required
                />
                <span className="bg-base-300 flex items-center px-4 border-y border-r border-base-300 rounded-r-lg">
                  Days
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Revisions</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="input input-bordered w-full rounded-r-none"
                  min="0"
                  value={formData.revisions}
                  onChange={(e) =>
                    setFormData({ ...formData, revisions: e.target.value })
                  }
                  required
                />
                <span className="bg-base-300 flex items-center px-4 border-y border-r border-base-300 rounded-r-lg">
                  Revisions
                </span>
              </div>
            </div>
          </div>

          <div className="modal-action border-t pt-4">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
      <label className="modal-backdrop" onClick={onCancel}></label>
    </div>
  );
};

export default MyServices;
