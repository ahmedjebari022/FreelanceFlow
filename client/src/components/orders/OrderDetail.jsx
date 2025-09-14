import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import axios from "axios";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { socket, joinOrderRoom, leaveOrderRoom } = useContext(SocketContext);
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // New review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const [orderRes, messagesRes] = await Promise.all([
          axios.get(`/api/orders/${id}`, { withCredentials: true }),
          axios.get(`/api/orders/${id}/messages`, { withCredentials: true }),
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrderDetails();
      joinOrderRoom(id); // Join socket room for this order
    } else {
      navigate("/login");
    }

    // Clean up function
    return () => {
      if (user) {
        leaveOrderRoom(id); // Leave socket room when unmounting
      }
    };
  }, [id, user, navigate, joinOrderRoom, leaveOrderRoom]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Handle status updates
    const handleStatusUpdate = (update) => {
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: update.status,
        updatedAt: update.updatedAt,
      }));
    };

    socket.on("new-message", handleNewMessage);
    socket.on("status-update", handleStatusUpdate);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("status-update", handleStatusUpdate);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      const response = await axios.put(
        `/api/orders/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrder(response.data);
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessageLoading(true);
    try {
      await axios.post(
        `/api/orders/${id}/messages`,
        { content: newMessage },
        { withCredentials: true }
      );
      // Socket.IO will handle updating the messages via the 'new-message' event
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");

    try {
      await axios.post(
        `/api/services/${order.service._id}/reviews`,
        reviewData,
        { withCredentials: true }
      );

      // Update the order to mark it as reviewed
      const updatedOrder = { ...order, isReviewable: false };
      setOrder(updatedOrder);

      // Close the modal
      setShowReviewModal(false);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`, {
        withCredentials: true,
      });
      setOrder(response.data);
    } catch (err) {
      console.error("Failed to check payment status:", err);
    }
  };

  // Add this effect to periodically check payment status when unpaid
  useEffect(() => {
    if (order && order.paymentStatus === "unpaid") {
      const interval = setInterval(checkPaymentStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [order?.paymentStatus, id]);

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

  if (!order) return null;

  // Determine available actions based on role and current status
  const renderStatusActions = () => {
    const isFreelancer = user.id === order.freelancer._id;
    const isClient = user.id === order.client._id;

    if (isFreelancer) {
      switch (order.status) {
        case "pending":
          return (
            <>
              <button
                className="btn btn-success"
                onClick={() => handleStatusUpdate("accepted")}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Accept Order"
                )}
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Decline Order"
                )}
              </button>
            </>
          );
        case "accepted":
          return (
            <button
              className="btn btn-primary"
              onClick={() => handleStatusUpdate("in_progress")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Start Working"
              )}
            </button>
          );
        case "in_progress":
          return (
            <button
              className="btn btn-success"
              onClick={() => handleStatusUpdate("completed")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Mark as Completed"
              )}
            </button>
          );
        default:
          return null;
      }
    } else if (isClient) {
      if (order.status === "completed" && order.isReviewable) {
        return (
          <button
            className="btn btn-primary"
            onClick={() => setShowReviewModal(true)}
          >
            Leave a Review
          </button>
        );
      } else if (order.status === "pending") {
        return (
          <button
            className="btn btn-error"
            onClick={() => handleStatusUpdate("cancelled")}
            disabled={statusLoading}
          >
            {statusLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Cancel Order"
            )}
          </button>
        );
      }
    }

    return null;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "accepted":
        return "badge-info";
      case "in_progress":
        return "badge-primary";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Review this Service</h3>
            {reviewError && (
              <div className="alert alert-error mb-4">{reviewError}</div>
            )}
            <form onSubmit={handleReviewSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Rating</span>
                </label>
                <div className="rating rating-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating"
                      className="mask mask-star-2 bg-orange-400"
                      checked={reviewData.rating === star}
                      onChange={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Your Review</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Share your experience with this service..."
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reviewLoading || !reviewData.comment.trim()}
                >
                  {reviewLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order Details */}
        <div className="lg:w-1/3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-gray-500">Service:</span>
                  <div className="font-medium">{order.service.title}</div>
                </div>

                <div>
                  <span className="text-gray-500">Price:</span>
                  <div className="font-medium text-xl">${order.price}</div>
                </div>

                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">
                    <span
                      className={`badge ${getStatusBadgeClass(
                        order.status
                      )} badge-lg`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Ordered On:</span>
                  <div className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {order.startDate && (
                  <div>
                    <span className="text-gray-500">Started On:</span>
                    <div className="font-medium">
                      {new Date(order.startDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {order.completionDate && (
                  <div>
                    <span className="text-gray-500">Completed On:</span>
                    <div className="font-medium">
                      {new Date(order.completionDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-500">
                    {user.id === order.client._id ? "Freelancer:" : "Client:"}
                  </span>
                  <div className="font-medium">
                    {user.id === order.client._id
                      ? `${order.freelancer.firstName} ${order.freelancer.lastName}`
                      : `${order.client.firstName} ${order.client.lastName}`}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">Project Requirements</h3>
                <p className="p-4 bg-base-200 rounded-box">
                  {order.requirements}
                </p>
              </div>

              {/* Show review status for completed orders */}
              {order.status === "completed" && user.id === order.client._id && (
                <div className="mt-4">
                  {order.isReviewable ? (
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
                        Please leave a review for this completed service.
                      </span>
                    </div>
                  ) : (
                    <div className="alert alert-success">
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
                      <span>You've already reviewed this service.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Status */}
              <div>
                <span className="text-gray-500">Payment Status:</span>
                <div className="mt-1">
                  <span
                    className={`badge ${
                      order.paymentStatus === "paid"
                        ? "badge-success"
                        : order.paymentStatus === "pending"
                        ? "badge-warning"
                        : "badge-error"
                    } badge-lg`}
                  >
                    {order.paymentStatus === "paid"
                      ? "Paid"
                      : order.paymentStatus === "pending"
                      ? "Payment Processing"
                      : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Payment Button - Only show for clients with unpaid orders */}
              {user.id === order.client._id &&
                order.paymentStatus === "unpaid" && (
                  <div className="mt-4">
                    <Link
                      to={`/orders/${order._id}/payment`}
                      className="btn btn-primary w-full"
                    >
                      Pay Now
                    </Link>
                  </div>
                )}

              {/* Warning for freelancers with completed orders and unpaid status */}
              {user.id === order.freelancer._id &&
                order.status === "completed" &&
                order.paymentStatus === "paid" &&
                !user.stripeConnectId && (
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
                    <div>
                      <span className="block">
                        You have a pending payment but haven't set up your payment
                        account yet.
                      </span>
                      <Link
                        to="/payment-setup"
                        className="btn btn-sm btn-primary mt-2"
                      >
                        Set Up Payment Account
                      </Link>
                    </div>
                  </div>
                )}

              <div className="card-actions justify-end mt-6">
                {renderStatusActions()}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="lg:w-2/3">
          <div className="card bg-base-100 shadow-xl h-full flex flex-col">
            <div className="card-body flex-grow-0">
              <h2 className="card-title text-2xl">Messages</h2>
            </div>

            <div
              className="px-6 overflow-y-auto flex-grow"
              style={{ maxHeight: "400px", minHeight: "300px" }}
            >
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`chat ${
                        message.sender._id === user.id ||
                        message.sender === user.id
                          ? "chat-end"
                          : "chat-start"
                      }`}
                    >
                      <div className="chat-header">
                        {message.sender._id === order.freelancer._id ||
                        message.sender === order.freelancer._id
                          ? `${order.freelancer.firstName} (Freelancer)`
                          : `${order.client.firstName} (Client)`}
                        <time className="text-xs opacity-50 ml-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </time>
                      </div>
                      <div
                        className={`chat-bubble ${
                          message.sender._id === user.id ||
                          message.sender === user.id
                            ? "chat-bubble-primary"
                            : ""
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            <div className="card-body flex-grow-0 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="input input-bordered flex-grow"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={messageLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={messageLoading || !newMessage.trim()}
                >
                  {messageLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
