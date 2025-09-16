import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("grid"); // grid or list view option

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
        console.error("Error fetching categories:", err);
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
    e.preventDefault();
  };

  // Sample icons for categories (in a real app, these would come from your database)
  const getCategoryIcon = (name) => {
    const icons = {
      "Web Development": "code",
      "Graphic Design": "brush",
      "Digital Marketing": "trending-up",
      "Content Writing": "edit",
      "Video Production": "video",
      "Mobile Development": "smartphone",
      "UI/UX Design": "layout",
      "Business Consulting": "briefcase",
      "Data Analysis": "bar-chart",
      Translation: "globe",
    };

    // Default icon if not found
    return icons[name] || "category";
  };

  return (
    <div className="bg-base-200 min-h-screen pb-16">
      {/* Breadcrumbs - Remove rounded corners and connect to navbar */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="text-primary font-medium">Categories</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        {/* Header Section with Animation */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 flex justify-center">
            <div className="blur-3xl opacity-20 w-96 h-32 bg-primary rounded-full"></div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Explore Categories</h1>
          <div className="h-1 w-24 bg-primary mx-auto my-4 rounded-full"></div>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Discover specialized services across various categories to match
            your project needs
          </p>

          {/* Search Section */}
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="join w-full shadow-lg">
              <input
                type="text"
                placeholder="Search categories..."
                className="input input-bordered join-item w-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn join-item btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* View toggle and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="stats shadow mb-4 sm:mb-0">
            <div className="stat place-items-center">
              <div className="stat-title">Categories</div>
              <div className="stat-value text-primary">{categories.length}</div>
              <div className="stat-desc">Available to explore</div>
            </div>
          </div>

          <div className="btn-group">
            <button
              className={`btn ${activeView === "grid" ? "btn-active" : ""}`}
              onClick={() => setActiveView("grid")}
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
            <button
              className={`btn ${activeView === "list" ? "btn-active" : ""}`}
              onClick={() => setActiveView("list")}
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
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/70">Loading categories...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg max-w-2xl mx-auto">
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
            <div>
              <h3 className="font-bold">Error!</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button className="btn btn-sm" onClick={() => setSearchTerm("")}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="alert alert-info shadow-lg max-w-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">No results found</h3>
              <div className="text-xs">
                No categories matching "{searchTerm}" were found
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => setSearchTerm("")}>
              Clear Search
            </button>
          </div>
        )}

        {/* Grid View */}
        {activeView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/services-by-category?category=${category.slug}`}
                className="card bg-base-100 hover:bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <figure className="relative">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24 text-primary/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d={getIconPath(getCategoryIcon(category.name))}
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-300/90 to-transparent h-16"></div>
                </figure>
                <div className="card-body">
                  <h2 className="card-title justify-center text-xl text-center group-hover:text-primary transition-colors">
                    {category.name}
                    <div className="badge badge-primary badge-sm">
                      {category.serviceCount || ""}
                    </div>
                  </h2>
                  <p className="text-base-content/70 text-center text-sm line-clamp-2">
                    {category.description}
                  </p>
                  <div className="card-actions justify-center mt-4">
                    <button className="btn btn-primary btn-sm btn-wide">
                      Browse Services
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* List View */}
        {activeView === "list" && (
          <div className="flex flex-col gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/services-by-category?category=${category.slug}`}
                className="card card-side bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:bg-base-200"
              >
                <figure className="w-36 md:w-48">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
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
                          strokeWidth="1"
                          d={getIconPath(getCategoryIcon(category.name))}
                        />
                      </svg>
                    </div>
                  )}
                </figure>
                <div className="card-body">
                  <h2 className="card-title">
                    {category.name}
                    <div className="badge badge-primary badge-sm">
                      {category.serviceCount || ""}
                    </div>
                  </h2>
                  <p className="text-base-content/70">{category.description}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm">
                      Browse Services
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get SVG path data for different icons
function getIconPath(icon) {
  switch (icon) {
    case "code":
      return "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4";
    case "brush":
      return "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
    case "trending-up":
      return "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6";
    case "edit":
      return "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";
    case "video":
      return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
    case "smartphone":
      return "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z";
    case "layout":
      return "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z";
    case "briefcase":
      return "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
    case "bar-chart":
      return "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";
    case "globe":
      return "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    case "category":
    default:
      return "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10";
  }
}

export default CategoryGrid;
