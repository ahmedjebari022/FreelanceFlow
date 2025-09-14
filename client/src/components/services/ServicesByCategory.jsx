import { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const ServicesByCategory = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/services?category=${category}`);
        setServices(response.data);
      } catch (err) {
        setError("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchServices();
    }
  }, [category]);

  // Update the handleCreateService function
  const handleCreateService = async (serviceData) => {
    try {
      // First, get the category ID
      const categoryRes = await axios.get(`/api/categories/${category}`);
      const categoryId = categoryRes.data._id;

      const formData = new FormData();
      formData.append("title", serviceData.title);
      formData.append("description", serviceData.description);
      formData.append("price", serviceData.price);
      formData.append("category", categoryId); // Use the category ID instead of slug

      // Append each image file
      serviceData.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post("/api/services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Add this to ensure authentication
      });

      setServices([...services, response.data]);
      setShowCreateForm(false);
    } catch (err) {
      console.error(
        "Error creating service:",
        err.response?.data || err.message
      );
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services in {category}</h1>
        {user?.role === "freelancer" && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Service
          </button>
        )}
      </div>

      {/* Create Service Modal */}
      {showCreateForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl relative">
            <h3 className="text-2xl font-bold mb-6">Create New Service</h3>
            <CreateServiceForm
              onSubmit={handleCreateService}
              onCancel={() => setShowCreateForm(false)}
              category={category}
            />
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center text-gray-600">
          No services found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="card lg:card-side bg-base-100 shadow-xl"
            >
              <figure className="lg:w-1/3">
                {service.images && service.images[0] ? (
                  <img
                    src={service.images[0].url}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-base-200 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </figure>
              <div className="card-body lg:w-2/3">
                <h2 className="card-title text-2xl">{service.title}</h2>
                <p className="text-gray-600">{service.description}</p>

                {/* Freelancer Info */}
                <div className="flex items-center mt-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}`}
                        alt="freelancer"
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">
                      {service.freelancer.firstName}{" "}
                      {service.freelancer.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {service.freelancer.location}
                    </p>
                  </div>
                </div>

                {/* Price and Rating */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-2xl font-bold text-primary">
                    ${service.price}
                  </div>
                  <div className="flex items-center">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          name={`rating-${service._id}`}
                          className="mask mask-star-2 bg-orange-400"
                          checked={Math.round(service.averageRating) === star}
                          readOnly
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({service.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/services/${service._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create a new component for the service creation form
const CreateServiceForm = ({ onSubmit, onCancel, category }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    images: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: files,
    });
  };

  return (
    <>
      <button
        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onClick={onCancel}
      >
        ✕
      </button>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6 p-2">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Service Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter service title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-[120px]"
              placeholder="Describe your service in detail"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-semibold">Price ($)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={category}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Images</span>
              <span className="label-text-alt text-gray-500">Max 5 images</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              required
            />
          </div>
        </div>

        <div className="modal-action border-t pt-4">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Service
          </button>
        </div>
      </form>
    </>
  );
};

export default ServicesByCategory;
