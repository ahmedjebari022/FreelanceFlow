import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/categories${searchTerm ? `?search=${searchTerm}` : ""}`
        );
        setCategories(response.data);
      } catch (err) {
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    // The search is already handled by the useEffect
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
        <p className="text-gray-600">Find the perfect service for your needs</p>

        {/* Search Bar - Wrap in form and add onSubmit handler */}
        <form
          onSubmit={handleSearch}
          className="form-control w-full max-w-md mx-auto mt-8"
        >
          <div className="input-group">
            <input
              type="text"
              placeholder="Search categories..."
              className="input input-bordered w-full focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={false} // Never disable the input
            />
            <button type="submit" className="btn btn-square" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
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
              )}
            </button>
          </div>
        </form>

        {/* Loading indicator for categories only */}
        {loading && (
          <div className="mt-4">
            <span className="loading loading-dots loading-md"></span>
          </div>
        )}

        {error && <div className="alert alert-error mt-4">{error}</div>}

        {categories.length === 0 && searchTerm && !loading && (
          <div className="text-gray-600 mt-4">
            No categories found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/services?category=${category.slug}`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200"
          >
            {category.image && (
              <figure className="px-4 pt-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="rounded-xl h-48 w-full object-cover"
                />
              </figure>
            )}
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl">
                {category.name}
              </h2>
              <p className="text-gray-600">{category.description}</p>
              <div className="card-actions justify-center mt-4">
                <button className="btn btn-primary">Browse Services</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
