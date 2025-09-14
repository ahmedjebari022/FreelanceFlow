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
    }
  };

  const handleDeleteService = async () => {
    try {
      await axios.delete(`/api/services/${deletingService._id}`, {
        withCredentials: true,
      });
      setServices(services.filter((s) => s._id !== deletingService._id));
      setDeletingService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Services</h1>

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
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete "{deletingService.title}"? This
              action cannot be undone.
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
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.title}</td>
                <td>{service.category?.name || "N/A"}</td>
                <td>${service.price}</td>
                <td>
                  <span
                    className={`badge ${
                      service.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="flex gap-2">
                  <Link
                    to={`/services/${service._id}`}
                    className="btn btn-xs btn-outline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setEditingService(service)}
                    className="btn btn-xs btn-outline btn-info"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingService(service)}
                    className="btn btn-xs btn-outline btn-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EditServiceModal = ({ service, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: service.title,
    description: service.description,
    price: service.price,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl relative">
        <h3 className="text-2xl font-bold mb-6">Edit Service</h3>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onCancel}
        >
          ✕
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-[120px]"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Price ($)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div className="modal-action border-t pt-4">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyServices;