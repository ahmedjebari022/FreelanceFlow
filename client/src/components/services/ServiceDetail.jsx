import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceRes = await axios.get(`/api/services/${id}`);
        console.log("Service category data:", serviceRes.data.category);
        console.log("Category slug:", serviceRes.data.category?.slug);
        setService(serviceRes.data);
        const reviewsRes = await axios.get(`/api/services/${id}/reviews`);
        setReviews(reviewsRes.data);

        // Set document title for better SEO
        document.title = `${serviceRes.data.title} | FreelanceFlow`;
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(`/services/${id}`));
      return;
    }

    if (user.role !== "client") {
      setError("Only clients can place orders");
      return;
    }

    setShowOrderModal(true);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    setError("");

    try {
      await axios.post(
        "/api/orders",
        {
          serviceId: id,
          requirements,
        },
        { withCredentials: true }
      );

      setShowOrderModal(false);
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Service Not Found</h1>
            <p className="py-6">
              The service you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/services" className="btn btn-primary">
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayedReviews = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  );

  // Check if current user is the freelancer of this service
  const isOwner = user && user._id === service.freelancer._id;

  // Format dates for reviews
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              {service.category && (
                <li>
                  {/* Convert category name to a URL-friendly slug if backend doesn't provide one */}
                  <Link
                    to={`/services-by-category?category=${
                      service.category.slug ||
                      service.category.name.toLowerCase().replace(/\s+/g, "-")
                    }`}
                  >
                    {service.category.name}
                  </Link>
                </li>
              )}
              <li className="text-primary font-medium">{service.title}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-xl mb-2">Place an Order</h3>
            <div className="divider my-2"></div>

            <div className="flex items-center my-4 bg-base-200 p-3 rounded-box">
              <div className="avatar">
                <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={
                      service.images && service.images[0]
                        ? service.images[0].url
                        : `https://ui-avatars.com/api/?name=${service.title}`
                    }
                    alt={service.title}
                  />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="font-bold">{service.title}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-bold text-primary">
                    ${service.price}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{service.deliveryTime} days delivery</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error my-4">
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

            <form onSubmit={submitOrder}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">
                    Project Requirements
                  </span>
                </label>

                <div className="bg-base-200 p-4 rounded-lg mb-3">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      The more details you provide, the better your results will be
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="textarea textarea-bordered h-48 w-full text-base p-4 focus:border-primary"
                    placeholder=""
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    required
                  ></textarea>

                  {requirements.length === 0 && (
                    <div className="absolute top-4 left-4 right-4 pointer-events-none text-base-content/60">
                      <ul className="list-disc pl-5 space-y-4 leading-relaxed"> {/* Increased spacing and line height */}
                        <li>What specific deliverables do you need?</li>
                        <li>What's the purpose or goal of this project?</li>
                        <li>Do you have any examples or references?</li>
                        <li>
                          Are there any specific features, styles, or formats you
                          require?
                        </li>
                        <li>What's your timeline or any important deadlines?</li>
                      </ul>
                      <p className="mt-5 italic"></p> {/* More margin */}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-base-content/70">
                    Min. 30 characters recommended
                  </span>
                  <span
                    className={`text-xs ${
                      requirements.length < 30 ? "text-error" : "text-success"
                    }`}
                  >
                    {requirements.length} characters
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium text-sm">
                      Tips for great requirements
                    </div>
                    <div className="collapse-content text-sm">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Be specific about what you want to achieve</li>
                        <li>Provide examples of what you like or don't like</li>
                        <li>Include any brand guidelines or specific materials</li>
                        <li>Mention any technical specifications or constraints</li>
                        <li>Explain how the deliverables will be used</li>
                      </ul>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium text-sm">
                      Attach files (optional)
                    </div>
                    <div className="collapse-content">
                      <div className="form-control w-full">
                        <input
                          type="file"
                          className="file-input file-input-bordered w-full"
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            Upload references, examples, or other helpful files
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
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
                <span>
                  After placing your order, you'll be able to communicate with
                  the freelancer directly.
                </span>
              </div>

              <div className="divider my-4"></div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">
                    Total:{" "}
                    <span className="text-primary text-xl">
                      ${service.price}
                    </span>
                  </p>
                  <p className="text-sm text-base-content/70">
                    Delivery in {service.deliveryTime} days
                  </p>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={orderLoading}
                  >
                    {orderLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setShowOrderModal(false)}
          ></label>
        </div>
      )}

      <div className="container mx-auto p-4 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section */}
          <div className="lg:w-2/3">
            {/* Image Gallery */}
            <div className="card bg-base-100 shadow-xl overflow-hidden">
              <figure className="relative h-[400px]">
                {service.images && service.images[currentImage] ? (
                  <img
                    src={service.images[currentImage].url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-base-300 flex items-center justify-center">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Image Navigation Arrows */}
                {service.images?.length > 1 && (
                  <>
                    <button
                      className="btn btn-circle btn-sm absolute left-4 top-1/2 transform -translate-y-1/2 bg-base-100/80 hover:bg-base-100"
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === 0 ? service.images.length - 1 : prev - 1
                        )
                      }
                    >
                      ❮
                    </button>
                    <button
                      className="btn btn-circle btn-sm absolute right-4 top-1/2 transform -translate-y-1/2 bg-base-100/80 hover:bg-base-100"
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === service.images.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      ❯
                    </button>
                  </>
                )}
              </figure>

              {/* Thumbnail Images */}
              {service.images?.length > 1 && (
                <div className="card-body p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {service.images.map((image, index) => (
                      <div
                        key={index}
                        className={`w-20 h-14 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          index === currentImage
                            ? "border-primary scale-105"
                            : "border-transparent hover:border-base-300"
                        }`}
                        onClick={() => setCurrentImage(index)}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Title & Category */}
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="badge badge-primary mb-2">
                      {service.category.name}
                    </div>
                    <h1 className="card-title text-3xl mb-2">
                      {service.title}
                    </h1>
                  </div>
                  <div className="flex items-center">
                    <div className="rating rating-sm mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          className="mask mask-star-2 bg-orange-400"
                          checked={Math.round(service.averageRating) === star}
                          readOnly
                        />
                      ))}
                    </div>
                    <span className="text-sm">
                      {service.averageRating.toFixed(1)} ({service.totalReviews}{" "}
                      reviews)
                    </span>
                  </div>
                </div>

                {/* Freelancer Info */}
                <div className="flex items-center mt-6 p-4 bg-base-200 rounded-box">
                  <div className="avatar online">
                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={
                          service.freelancer.profileImage ||
                          `https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}&background=random`
                        }
                        alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-lg">
                      {service.freelancer.firstName}{" "}
                      {service.freelancer.lastName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      {service.freelancer.location && (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{service.freelancer.location}</span>
                        </>
                      )}
                      <span className="mx-1">•</span>
                      <span>
                        Member since{" "}
                        {new Date(service.freelancer.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button className="btn btn-sm btn-outline">
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Contact
                    </button>
                  </div>
                </div>

                {/* Service Description */}
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">About This Service</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{service.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Service Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="stats bg-base-200 shadow">
                    <div className="stat place-items-center">
                      <div className="stat-title">Delivery Time</div>
                      <div className="stat-value text-primary">
                        {service.deliveryTime}
                      </div>
                      <div className="stat-desc">Days</div>
                    </div>
                  </div>

                  <div className="stats bg-base-200 shadow">
                    <div className="stat place-items-center">
                      <div className="stat-title">Revisions</div>
                      <div className="stat-value text-primary">
                        {service.revisions}
                      </div>
                      <div className="stat-desc">Included</div>
                    </div>
                  </div>

                  <div className="stats bg-base-200 shadow">
                    <div className="stat place-items-center">
                      <div className="stat-title">Price</div>
                      <div className="stat-value text-primary">
                        ${service.price}
                      </div>
                      <div className="stat-desc">USD</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-success mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      What's Included
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-success mt-0.5 mr-2 flex-shrink-0"
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
                  </div>
                )}

                {/* Requirements */}
                {service.requirements && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-info mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      What I Need From You
                    </h3>
                    <div className="p-4 bg-base-200 rounded-lg mt-2">
                      <p className="whitespace-pre-wrap">
                        {service.requirements}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Reviews & Ratings
                  </h2>
                  <div className="flex items-center">
                    <div className="stats shadow">
                      <div className="stat place-items-center py-2">
                        <div className="stat-title">Rating</div>
                        <div className="stat-value text-primary text-2xl flex items-center gap-2">
                          {service.averageRating.toFixed(1)}
                          <div className="rating rating-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <input
                                key={star}
                                type="radio"
                                className="mask mask-star-2 bg-orange-400"
                                checked={
                                  Math.round(service.averageRating) === star
                                }
                                readOnly
                              />
                            ))}
                          </div>
                        </div>
                        <div className="stat-desc">
                          {service.totalReviews} reviews
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                {reviews.length > 0 ? (
                  <>
                    {displayedReviews.map((review) => (
                      <div key={review._id} className="card bg-base-200 mb-4">
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="avatar">
                                <div className="w-12 rounded-full">
                                  <img
                                    src={
                                      review.client.profileImage ||
                                      `https://ui-avatars.com/api/?name=${review.client.firstName}+${review.client.lastName}&background=random`
                                    }
                                    alt={`${review.client.firstName} ${review.client.lastName}`}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">
                                  {review.client.firstName}{" "}
                                  {review.client.lastName}
                                </div>
                                <div className="flex items-center mt-1">
                                  <div className="rating rating-xs mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <input
                                        key={star}
                                        type="radio"
                                        className="mask mask-star-2 bg-orange-400"
                                        checked={review.rating === star}
                                        readOnly
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-base-content/70">
                                    {review.createdAt &&
                                      formatDate(review.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* If you want to show which order this review is for */}
                            {review.order && (
                              <div className="badge badge-outline">
                                Order #{review.order.orderNumber}
                              </div>
                            )}
                          </div>

                          <div className="divider my-2"></div>

                          <div className="prose max-w-none">
                            <p>{review.comment}</p>
                          </div>

                          {/* Freelancer Response - if applicable */}
                          {review.response && (
                            <div className="bg-base-300 p-3 rounded-box mt-3">
                              <p className="font-bold text-sm flex items-center">
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
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                                Response from {service.freelancer.firstName}
                              </p>
                              <p className="text-sm mt-1">{review.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Review Pagination */}
                    {reviews.length > reviewsPerPage && (
                      <div className="flex justify-center mt-6">
                        <div className="join">
                          <button
                            className="join-item btn"
                            onClick={() => setCurrentReviewPage((p) => p - 1)}
                            disabled={currentReviewPage === 0}
                          >
                            «
                          </button>
                          <button className="join-item btn">
                            Page {currentReviewPage + 1} of{" "}
                            {Math.ceil(reviews.length / reviewsPerPage)}
                          </button>
                          <button
                            className="join-item btn"
                            onClick={() => setCurrentReviewPage((p) => p + 1)}
                            disabled={
                              (currentReviewPage + 1) * reviewsPerPage >=
                              reviews.length
                            }
                          >
                            »
                          </button>
                        </div>
                      </div>
                    )}
                  </>
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
                    <span>
                      No reviews yet. Be the first to review this service!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Purchase Card */}
          <div className="lg:w-1/3">
            <div className="card bg-base-100 shadow-xl sticky top-24">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title text-3xl">${service.price}</h2>
                  <div className="badge badge-outline p-3">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {service.deliveryTime} days delivery
                  </div>
                </div>

                <div className="divider"></div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{service.revisions} Revisions</span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Full ownership of deliverables</span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Direct communication with freelancer</span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Secure payments</span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="mt-6 space-y-4">
                  {!isOwner ? (
                    <>
                      <button
                        className="btn btn-primary btn-block"
                        onClick={handleOrder}
                        disabled={!user || user.role !== "client"}
                      >
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Place Order
                      </button>

                      <button className="btn btn-outline btn-block">
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Contact Freelancer
                      </button>

                      {!user && (
                        <div className="alert alert-info shadow-lg">
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
                          <div>
                            <h3 className="font-bold">Login Required</h3>
                            <div className="text-xs">
                              Please login as a client to place orders
                            </div>
                          </div>
                          <Link
                            to={`/login?redirect=/services/${id}`}
                            className="btn btn-sm"
                          >
                            Login
                          </Link>
                        </div>
                      )}

                      {user && user.role !== "client" && (
                        <div className="alert alert-warning shadow-lg">
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
                          <div>
                            <h3 className="font-bold">
                              Client Account Required
                            </h3>
                            <div className="text-xs">
                              Only clients can place orders
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="alert alert-success shadow-lg">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h3 className="font-bold">This is your service</h3>
                        <div className="text-xs">
                          You can view and manage it from your dashboard
                        </div>
                      </div>
                      <Link to="/my-services" className="btn btn-sm">
                        Manage
                      </Link>
                    </div>
                  )}
                </div>

                <div className="divider my-4">Service Guarantee</div>

                <div className="flex items-center p-3 bg-base-200 rounded-box">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium">Money-Back Guarantee</h3>
                    <p className="text-xs text-base-content/70">
                      Your payment is protected until you approve the work
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Save */}
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body p-4">
                <h3 className="font-bold">Share this service</h3>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-circle btn-outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-facebook"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.049H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                    </svg>
                  </button>
                  <button className="btn btn-circle btn-outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-twitter"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                    </svg>
                  </button>
                  <button className="btn btn-circle btn-outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-linkedin"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                    </svg>
                  </button>
                  <button className="btn btn-circle btn-outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-envelope"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
