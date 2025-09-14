import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        const reviewsRes = await axios.get(`/api/services/${id}/reviews`);
        setService(serviceRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOrder = async () => {
    if (!user) {
      navigate("/login");
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
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!service) return null;

  const displayedReviews = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  );

  // Check if current user is the freelancer of this service
  const isOwner = user && user.id === service.freelancer._id;

  return (
    <div className="container mx-auto p-4">
      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Place an Order</h3>
            {error && <div className="alert alert-error my-2">{error}</div>}
            <form onSubmit={submitOrder}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Requirements</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe your project requirements in detail..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required
                ></textarea>
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
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section */}
        <div className="lg:w-2/3">
          {/* Image Gallery */}
          <div className="card bg-base-100">
            <figure className="relative h-40">
              {service.images && service.images[currentImage] && (
                <img
                  src={service.images[currentImage].url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              )}
              {service.images?.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-base-100 rounded-lg shadow-lg">
                  <div className="join">
                    <button
                      className="btn btn-xs join-item"
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === 0 ? service.images.length - 1 : prev - 1
                        )
                      }
                    >
                      ❮
                    </button>
                    <button className="btn btn-xs join-item no-animation">
                      {currentImage + 1}/{service.images.length}
                    </button>
                    <button
                      className="btn btn-xs join-item"
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === service.images.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      ❯
                    </button>
                  </div>
                </div>
              )}
            </figure>
          </div>

          {/* Service Info */}
          <div className="card bg-base-100 mt-8">
            <div className="card-body">
              <h1 className="card-title text-3xl">{service.title}</h1>
              <p className="mt-4">{service.description}</p>

              {/* Freelancer Info */}
              <div className="flex items-center mt-6 p-4 bg-base-200 rounded-box">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <img
                      src={`https://ui-avatars.com/api/?name=${service.freelancer.firstName}+${service.freelancer.lastName}`}
                      alt="freelancer"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="font-bold">
                    {service.freelancer.firstName} {service.freelancer.lastName}
                  </div>
                  <div className="text-sm">{service.freelancer.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Modified navigation */}
          <div className="card bg-base-100 mt-8">
            <div className="card-body">
              <h2 className="card-title">
                Reviews ({service.totalReviews})
                <div className="rating rating-sm ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      className="mask mask-star-2"
                      checked={Math.round(service.averageRating) === star}
                      readOnly
                    />
                  ))}
                </div>
              </h2>

              {reviews.length > 0 ? (
                <>
                  {displayedReviews.map((review) => (
                    <div key={review._id} className="border-b py-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={`https://ui-avatars.com/api/?name=${review.client.firstName}+${review.client.lastName}`}
                              alt="client"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {review.client.firstName} {review.client.lastName}
                          </div>
                          <div className="rating rating-xs">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <input
                                key={star}
                                type="radio"
                                className="mask mask-star-2"
                                checked={review.rating === star}
                                readOnly
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                    </div>
                  ))}

                  {/* Modified Review Navigation */}
                  {reviews.length > reviewsPerPage && (
                    <div className="flex justify-center mt-4">
                      <div className="join">
                        <button
                          className="btn btn-sm join-item"
                          onClick={() => setCurrentReviewPage((p) => p - 1)}
                          disabled={currentReviewPage === 0}
                        >
                          ❮
                        </button>
                        <button className="btn btn-sm join-item no-animation">
                          {currentReviewPage + 1}/
                          {Math.ceil(reviews.length / reviewsPerPage)}
                        </button>
                        <button
                          className="btn btn-sm join-item"
                          onClick={() => setCurrentReviewPage((p) => p + 1)}
                          disabled={
                            (currentReviewPage + 1) * reviewsPerPage >=
                            reviews.length
                          }
                        >
                          ❯
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  No reviews yet. Be the first to review!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Purchase Card */}
        <div className="lg:w-1/3">
          <div className="card bg-base-100 sticky top-4">
            <div className="card-body">
              <h2 className="card-title text-3xl">${service.price}</h2>
              <div className="mt-6 space-y-4">
                {!isOwner ? (
                  <>
                    <button
                      className="btn btn-primary w-full"
                      onClick={handleOrder}
                      disabled={!user || user.role !== "client"}
                    >
                      Place Order
                    </button>
                    {!user && (
                      <div className="alert alert-info">
                        Please login as a client to place orders
                      </div>
                    )}
                    {user && user.role !== "client" && (
                      <div className="alert alert-info">
                        Only clients can place orders
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-info">This is your service</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
