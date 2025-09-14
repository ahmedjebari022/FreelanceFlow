import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const categories = [
    "Web Development",
    "Design",
    "Writing",
    "Marketing",
    "Video",
    "Music",
    "Business",
    "Other",
  ];

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedCategory, priceRange]);

  const fetchServices = async () => {
    try {
      let url = "/api/services?";
      if (searchTerm) url += `search=${searchTerm}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (priceRange.min) url += `minPrice=${priceRange.min}&`;
      if (priceRange.max) url += `maxPrice=${priceRange.max}`;

      const response = await axios.get(url);
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch services");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Search and Filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-6 space-y-4">
        {/* Search Bar */}
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search services..."
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            className="select select-bordered w-full md:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min price"
            className="input input-bordered w-full md:w-auto"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Max price"
            className="input input-bordered w-full md:w-auto"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
          />

          {/* View Toggle */}
          <div className="btn-group">
            <button
              className={`btn ${isGridView ? "btn-active" : ""}`}
              onClick={() => setIsGridView(true)}
            >
              Grid
            </button>
            <button
              className={`btn ${!isGridView ? "btn-active" : ""}`}
              onClick={() => setIsGridView(false)}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Services Display */}
      {services.length === 0 ? (
        <div className="text-center py-8">No services found</div>
      ) : isGridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="card bg-base-100 shadow-xl">
              {service.images && service.images[0] && (
                <figure>
                  <img
                    src={service.images[0].url}
                    alt={service.title}
                    className="h-48 w-full object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{service.title}</h2>
                <p className="text-sm line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-primary font-bold">
                    ${service.price}
                  </span>
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
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="card card-side bg-base-100 shadow-xl"
            >
              {service.images && service.images[0] && (
                <figure className="w-48">
                  <img
                    src={service.images[0].url}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{service.title}</h2>
                <p>{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-primary font-bold">
                    ${service.price}
                  </span>
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
  );
};

export default ServiceList;
