import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusChangeReason, setStatusChangeReason] = useState("");

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/services/${serviceId}`);
        setService(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Failed to load service details");
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const handleStatusChangeClick = (status) => {
    setNewStatus(status);
    setStatusChangeReason("");
    setIsStatusChangeModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.patch(
        `/api/admin/services/${serviceId}/status`,
        {
          status: newStatus,
          reason: statusChangeReason,
        }
      );

      setService(response.data);
      setIsStatusChangeModalOpen(false);
      setNewStatus("");
      setStatusChangeReason("");
    } catch (err) {
      console.error("Error changing service status:", err);
      setError("Failed to change service status");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
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

  if (!service) {
    return (
      <div className="alert alert-warning">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Service not found</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <Link to="/admin">Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/services">Services</Link>
              </li>
              <li>{service.title}</li>
            </ul>
          </div>
          <h1 className="text-3xl font-bold">{service.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/services")}
          >
            Back to Services
          </button>

          {service.status === "pending" && (
            <>
              <button
                className="btn btn-success"
                onClick={() => handleStatusChangeClick("active")}
              >
                Approve
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleStatusChangeClick("rejected")}
              >
                Reject
              </button>
            </>
          )}

          {service.status === "active" && (
            <button
              className="btn btn-warning"
              onClick={() => handleStatusChangeClick("inactive")}
            >
              Deactivate
            </button>
          )}

          {service.status === "inactive" && (
            <button
              className="btn btn-success"
              onClick={() => handleStatusChangeClick("active")}
            >
              Activate
            </button>
          )}

          {service.status === "rejected" && (
            <button
              className="btn btn-success"
              onClick={() => handleStatusChangeClick("active")}
            >
              Approve
            </button>
          )}
        </div>
      </div>

      {/* Service details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Service Images</h2>

              {service.images && service.images.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <img
                      src={service.images[activeImage].url}
                      alt={`${service.title} - Image ${activeImage + 1}`}
                      className="w-full h-80 object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {service.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 rounded-md overflow-hidden ${
                          index === activeImage
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setActiveImage(index)}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No images available for this service</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Description</h2>
              <div className="prose max-w-none">
                <p>{service.description}</p>
              </div>
            </div>
          </div>

          {/* Status history */}
          {service.statusHistory && service.statusHistory.length > 0 && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title">Status History</h2>
                <ul className="timeline timeline-vertical">
                  {service.statusHistory.map((history, index) => (
                    <li key={index}>
                      <div className="timeline-start">
                        {new Date(history.date).toLocaleDateString()}
                      </div>
                      <div className="timeline-middle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="timeline-end timeline-box">
                        <div className="font-semibold">
                          Status changed to: {history.status}
                        </div>
                        {history.reason && (
                          <div className="text-sm mt-1">{history.reason}</div>
                        )}
                      </div>
                      {index < service.statusHistory.length - 1 && <hr />}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Features & Requirements */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Features & Requirements</h2>

              <div className="divider">What's Included</div>

              {service.features && service.features.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mt-0.5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No features specified for this service</span>
                </div>
              )}

              <div className="divider">Requirements</div>

              {service.requirements ? (
                <div className="p-4 bg-base-200 rounded-lg">
                  <p className="whitespace-pre-wrap">{service.requirements}</p>
                </div>
              ) : (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No requirements specified for this service</span>
                </div>
              )}

              <div className="divider">Delivery Terms</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold block">Delivery Time:</span>
                  <span>{service.deliveryTime || "N/A"} days</span>
                </div>

                <div>
                  <span className="font-semibold block">Revisions:</span>
                  <span>
                    {service.revisions !== undefined
                      ? service.revisions
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width on large screens */}
        <div>
          {/* Service Info Card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Service Information</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <span className="font-semibold block">Current Status:</span>
                  <div className="mt-1">{getStatusBadge(service.status)}</div>
                </div>

                <div>
                  <span className="font-semibold block">Category:</span>
                  <span>
                    {service.category ? service.category.name : "Uncategorized"}
                  </span>
                </div>

                <div>
                  <span className="font-semibold block">Base Price:</span>
                  <span>{formatCurrency(service.price)}</span>
                </div>

                <div>
                  <span className="font-semibold block">Created On:</span>
                  <span>
                    {new Date(service.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="font-semibold block">Last Updated:</span>
                  <span>
                    {new Date(service.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancer Info Card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Freelancer Information</h2>

              {service.freelancer ? (
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        <img
                          src={`https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}&size=64`}
                          alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link
                          to={`/admin/users/${service.freelancer._id}`}
                          className="hover:underline"
                        >
                          {service.freelancer.firstName}{" "}
                          {service.freelancer.lastName}
                        </Link>
                      </h3>
                      <div className="badge badge-primary">Freelancer</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold block">Email:</span>
                      <span>{service.freelancer.email}</span>
                    </div>

                    <div>
                      <span className="font-semibold block">Member Since:</span>
                      <span>
                        {new Date(
                          service.freelancer.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/admin/users/${service.freelancer._id}`}
                      className="btn btn-outline btn-sm w-full mt-4"
                    >
                      View Freelancer Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning mt-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Freelancer information is not available</span>
                </div>
              )}
            </div>
          </div>

          {/* Service Stats */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Service Stats</h2>
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">Orders</div>
                  <div className="stat-value">{service.orderCount || 0}</div>
                  <div className="stat-desc">Total orders for this service</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Revenue</div>
                  <div className="stat-value">
                    {formatCurrency(service.revenue || 0)}
                  </div>
                  <div className="stat-desc">Total revenue generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {isStatusChangeModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Service Status</h3>
            <p className="py-4">
              Are you sure you want to change the status of "{service.title}" to{" "}
              {newStatus}?
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
                onClick={() => setIsStatusChangeModalOpen(false)}
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

export default AdminServiceDetails;
