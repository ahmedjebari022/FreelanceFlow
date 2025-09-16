import { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const ServicesByCategory = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [services, setServices] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useContext(AuthContext);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("recommended");
  const [view, setView] = useState("list"); // list or grid
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch services and category details in parallel
        const [servicesRes, categoryRes] = await Promise.all([
          axios.get(`/api/services?category=${encodeURIComponent(category)}`),
          axios.get(`/api/categories/${category}`),
        ]);

        setServices(servicesRes.data);
        setCategoryDetails(categoryRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...services];

    // Apply price filter
    result = result.filter(
      (service) =>
        service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    // Apply sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      result.sort((a, b) => b.averageRating - a.averageRating);
    }

    setFilteredServices(result);
  }, [services, priceRange, sortOption]);

  const handleCreateService = async (serviceData) => {
    try {
      // First, get the category ID
      const categoryRes = await axios.get(`/api/categories/${category}`);
      const categoryId = categoryRes.data._id;

      const formData = new FormData();
      formData.append("title", serviceData.title);
      formData.append("description", serviceData.description);
      formData.append("price", serviceData.price);
      formData.append("category", categoryId);

      // Add the new fields
      formData.append("requirements", serviceData.requirements);
      formData.append("deliveryTime", serviceData.deliveryTime);
      formData.append("revisions", serviceData.revisions);

      // Add features as JSON string
      formData.append(
        "features",
        JSON.stringify(serviceData.features.filter((f) => f.trim() !== ""))
      );

      // Append each image file
      serviceData.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post("/api/services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
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
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center p-4">
        <div className="alert alert-error shadow-lg max-w-xl">
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
          <div>
            <h3 className="font-bold">Error!</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen pb-16">
      {/* Breadcrumbs - Directly connected to navbar */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              <li className="text-primary font-medium">
                {categoryDetails?.name ||
                  category
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        {/* Header with Category Info */}
        <div className="bg-base-100 rounded-box shadow-lg p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              {categoryDetails?.image ? (
                <img
                  src={categoryDetails.image}
                  alt={categoryDetails.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">
                  {categoryDetails?.name || category}
                </h1>
                <p className="text-base-content/70">
                  {filteredServices.length} services available
                </p>
              </div>
            </div>

            <p className="max-w-3xl">
              {categoryDetails?.description ||
                "Explore professional services in this category."}
            </p>

            {user?.role === "freelancer" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary mt-4"
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
                Create New Service
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-1/4">
            <div className="bg-base-100 rounded-box shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Filters</h3>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Price Range</span>
                  <span className="label-text-alt">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="range range-xs range-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="range range-xs range-primary"
                  />
                </div>
              </div>

              <div className="divider"></div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Sort By</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="divider"></div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">View</span>
                </label>
                <div className="btn-group w-full">
                  <button
                    className={`btn flex-1 ${
                      view === "list" ? "btn-active" : ""
                    }`}
                    onClick={() => setView("list")}
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                  <button
                    className={`btn flex-1 ${
                      view === "grid" ? "btn-active" : ""
                    }`}
                    onClick={() => setView("grid")}
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            {filteredServices.length === 0 ? (
              <div className="bg-base-100 rounded-box shadow-lg p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 18a6 6 0 100-12 6 6 0 000 12z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold">No services found</h3>
                  <p className="text-base-content/70 max-w-md">
                    We couldn't find any services matching your criteria. Try
                    adjusting your filters or check back later.
                  </p>
                  <button
                    className="btn btn-primary mt-4"
                    onClick={() => {
                      setPriceRange([0, 1000]);
                      setSortOption("recommended");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : view === "list" ? (
              <div className="space-y-6">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="card lg:card-side bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <figure className="lg:w-1/3 relative overflow-hidden">
                      {service.images && service.images[0] ? (
                        <img
                          src={service.images[0].url}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-full w-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-primary/60"
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
                      {service.averageRating > 0 && (
                        <div className="absolute top-2 left-2 badge badge-primary gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            stroke="none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                          {service.averageRating.toFixed(1)}
                        </div>
                      )}
                    </figure>
                    <div className="card-body lg:w-2/3">
                      <h2 className="card-title text-xl hover:text-primary transition-colors">
                        {service.title}
                      </h2>
                      <p className="text-base-content/70 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {service.features &&
                          service.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="badge badge-outline">
                              {feature}
                            </div>
                          ))}
                        {service.features && service.features.length > 3 && (
                          <div className="badge badge-outline">
                            +{service.features.length - 3} more
                          </div>
                        )}
                      </div>

                      <div className="flex items-center mt-4">
                        <div className="avatar online">
                          <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                            <img
                              src={`https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}&background=random`}
                              alt="freelancer"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">
                            {service.freelancer.firstName}{" "}
                            {service.freelancer.lastName}
                          </h3>
                          <p className="text-xs text-base-content/70">
                            {service.freelancer.location || "Freelancer"}
                          </p>
                        </div>
                      </div>

                      <div className="card-actions justify-between items-center mt-4">
                        <div className="text-2xl font-bold text-primary">
                          ${service.price}
                        </div>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <figure className="relative h-52">
                      {service.images && service.images[0] ? (
                        <img
                          src={service.images[0].url}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-full w-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-primary/60"
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
                      {service.averageRating > 0 && (
                        <div className="absolute top-2 left-2 badge badge-primary gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            stroke="none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                          {service.averageRating.toFixed(1)}
                        </div>
                      )}
                    </figure>
                    <div className="card-body">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="avatar online">
                          <div className="w-8 rounded-full">
                            <img
                              src={`https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}&background=random`}
                              alt="freelancer"
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">
                            {service.freelancer.firstName}{" "}
                            {service.freelancer.lastName}
                          </h3>
                        </div>
                      </div>

                      <h2 className="card-title hover:text-primary transition-colors">
                        {service.title}
                      </h2>
                      <p className="text-base-content/70 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="divider my-1"></div>

                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-primary">
                          ${service.price}
                        </div>
                        <Link
                          to={`/services/${service._id}`}
                          className="btn btn-primary btn-sm"
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
        </div>
      </div>

      {/* Create Service Modal */}
      {showCreateForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl relative">
            <h3 className="text-2xl font-bold mb-6">Create New Service</h3>
            <CreateServiceForm
              onSubmit={handleCreateService}
              onCancel={() => setShowCreateForm(false)}
              category={category}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Add the CreateServiceForm component
const CreateServiceForm = ({ onSubmit, onCancel, category }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    features: ["", "", ""], // Start with 3 empty features
    requirements: "",
    deliveryTime: 7,
    revisions: 3,
    images: [],
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      setError("Please enter a valid price");
      setLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      setError("Please upload at least one image");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    setFormData({
      ...formData,
      images: files,
    });

    // Generate previews
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImagePreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

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
    if (formData.features.length <= 1) return;

    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures,
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Service Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter a catchy title for your service"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Price ($)</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input input-bordered w-full"
              placeholder="Enter your service price"
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
          ></textarea>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Features</span>
            <span className="label-text-alt">What you'll provide</span>
          </label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 mb-2">
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
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeFeatureField(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {formData.features.length < 10 && (
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={addFeatureField}
            >
              Add Feature
            </button>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Requirements</span>
            <span className="label-text-alt">What you need from clients</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="What information or resources do you need from the client to get started?"
            value={formData.requirements}
            onChange={(e) =>
              setFormData({ ...formData, requirements: e.target.value })
            }
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Delivery Time (days)
              </span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="1"
              max="90"
              value={formData.deliveryTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deliveryTime: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Revisions</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="0"
              max="20"
              value={formData.revisions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  revisions: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Category</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={category
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Service will be listed in this category
            </span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Service Images</span>
            <span className="label-text-alt text-gray-500">
              Upload up to 5 images (Max 5MB each)
            </span>
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

        {imagePreview.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-2">
            {imagePreview.map((src, index) => (
              <div key={index} className="avatar">
                <div className="w-24 rounded">
                  <img src={src} alt={`Preview ${index + 1}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-action border-t pt-4 flex justify-between">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              "Create Service"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ServicesByCategory;
