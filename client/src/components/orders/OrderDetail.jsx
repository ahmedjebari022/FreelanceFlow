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
  const [payment, setPayment] = useState(null);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

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
        const [orderRes, messagesRes, paymentRes] = await Promise.all([
          axios.get(`/api/orders/${id}`, { withCredentials: true }),
          axios.get(`/api/orders/${id}/messages`, { withCredentials: true }),
          axios.get(`/api/payments/order/${id}`, { withCredentials: true }).catch(
            () => ({ data: null })
          ),
        ]);
        setOrder(orderRes.data);
        setMessages(messagesRes.data);
        if (paymentRes && paymentRes.data) {
          setPayment(paymentRes.data);
        }
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
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
          <div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/orders')}>Back to Orders</button>
          </div>
        </div>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="btn btn-success btn-sm sm:btn-md flex-1"
                onClick={() => handleStatusUpdate("accepted")}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Order
                  </>
                )}
              </button>
              <button
                className="btn btn-error btn-sm sm:btn-md flex-1"
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline Order
                  </>
                )}
              </button>
            </div>
          );
        case "accepted":
          return (
            <button
              className="btn btn-primary btn-sm sm:btn-md"
              onClick={() => handleStatusUpdate("in_progress")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Working
                </>
              )}
            </button>
          );
        case "in_progress":
          return (
            <button
              className="btn btn-success btn-sm sm:btn-md"
              onClick={() => handleStatusUpdate("completed")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Completed
                </>
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
            className="btn btn-primary btn-sm sm:btn-md"
            onClick={() => setShowReviewModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Leave a Review
          </button>
        );
      } else if (order.status === "pending") {
        return (
          <button
            className="btn btn-error btn-sm sm:btn-md"
            onClick={() => handleStatusUpdate("cancelled")}
            disabled={statusLoading}
          >
            {statusLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Order
              </>
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "accepted":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "in_progress":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        );
      case "completed":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const PaymentSummary = ({ order, payment }) => {
    if (!payment) return null;

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Payment Details
          </h2>

          <div className="divider my-0"></div>

          <div className="stats stats-vertical lg:stats-horizontal bg-base-200 shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Amount</div>
              <div className="stat-value text-primary">${payment.amount}</div>
              <div className="stat-desc">Order total</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Platform Fee</div>
              <div className="stat-value">${payment.platformFee}</div>
              <div className="stat-desc">10% service fee</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Freelancer Earnings</div>
              <div className="stat-value text-success">${payment.freelancerAmount}</div>
              <div className="stat-desc">Net amount</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-base-200 p-4 rounded-box">
              <div className="text-sm font-medium mb-2">Payment Status</div>
              <div className="flex items-center">
                <span className={`badge ${
                  payment.status === "succeeded" || payment.status === "transferred"
                    ? "badge-success"
                    : payment.status === "pending"
                    ? "badge-warning"
                    : "badge-error"
                } badge-lg`}>
                  {payment.status === "succeeded"
                    ? "Paid"
                    : payment.status === "transferred"
                    ? "Transferred"
                    : payment.status === "pending"
                    ? "Processing"
                    : "Failed"}
                </span>
                
                {(payment.status === "succeeded" || payment.status === "transferred") && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-box">
              <div className="text-sm font-medium mb-2">Payout Status</div>
              <div className="flex items-center">
                <span className={`badge ${
                  payment.payoutStatus === "completed"
                    ? "badge-success"
                    : "badge-warning"
                } badge-lg`}>
                  {payment.payoutStatus === "completed" ? "Released" : "Pending"}
                </span>
                
                {payment.payoutStatus === "completed" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {payment.payoutId && (
            <div className="bg-base-200 p-4 rounded-box mt-4">
              <div className="text-sm font-medium mb-2">Payment Reference</div>
              <div className="font-mono text-xs break-all bg-base-300 p-2 rounded-md">
                {payment.payoutId}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getProfileImage = (person) => {
    return person.profileImage || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=random`;
  };

  return (
    <div className="bg-base-200 min-h-screen pb-8">
      {/* Breadcrumbs */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/orders">Orders</Link></li>
              <li className="text-primary">Order #{order.orderNumber}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Order Header Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Order #{order.orderNumber}
                </h1>
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span 
                      className={`flex items-center gap-1.5 badge ${getStatusBadgeClass(order.status)} badge-lg py-3`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </span>

                    <span className="mx-1 text-base-content/40">•</span>
                    
                    <span className={`badge ${
                      order.paymentStatus === "paid"
                        ? "badge-success"
                        : order.paymentStatus === "pending"
                        ? "badge-warning"
                        : "badge-error"
                    } badge-lg py-3`}>
                      {order.paymentStatus === "paid"
                        ? "Payment Received"
                        : order.paymentStatus === "pending"
                        ? "Payment Processing"
                        : "Awaiting Payment"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="order-last md:order-none flex-grow md:flex-grow-0">
                <div className="stats bg-base-200 shadow">
                  <div className="stat py-2 px-4">
                    <div className="stat-title">Order Value</div>
                    <div className="stat-value text-primary text-2xl">${order.price}</div>
                    <div className="stat-desc">
                      {order.status === "completed" ? "Final price" : "Current price"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end flex-grow md:flex-grow-0">
                {renderStatusActions()}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline and Progress Bar */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Order Timeline
            </h2>

            <div className="divider my-0"></div>

            <div className="px-2">
              <ul className="steps steps-vertical md:steps-horizontal w-full">
                <li className={`step ${order.status !== "cancelled" ? "step-primary" : "step-error"}`}>Order Placed
                  <span className="text-xs block mt-1">{formatDate(order.createdAt).split(',')[0]}</span>
                </li>
                <li className={`step ${["accepted", "in_progress", "completed"].includes(order.status) ? "step-primary" : ""}`}>Accepted
                  {order.startDate && <span className="text-xs block mt-1">{formatDate(order.startDate).split(',')[0]}</span>}
                </li>
                <li className={`step ${["in_progress", "completed"].includes(order.status) ? "step-primary" : ""}`}>In Progress</li>
                <li className={`step ${order.status === "completed" ? "step-primary" : ""}`}>Completed
                  {order.completionDate && <span className="text-xs block mt-1">{formatDate(order.completionDate).split(',')[0]}</span>}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-1">
            {/* Service Details Card */}
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Service Details
                </h2>
                
                <div className="divider my-0"></div>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="avatar">
                    <div className="w-16 rounded-md">
                      <img 
                        src={order.service.image || `https://placehold.co/300x200?text=${encodeURIComponent(order.service.title)}`} 
                        alt={order.service.title}
                      />
                    </div>
                  </div>
                  <div>
                    <Link to={`/services/${order.service._id}`} className="link link-hover font-medium text-lg">{order.service.title}</Link>
                    <div className="text-sm text-base-content/70 mt-1">
                      <span className="badge badge-sm">{order.service.category?.name || "Service"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Details */}
                <div className="mt-6">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="text-base-content/70">Delivery Time:</div>
                    <div className="font-medium text-right">{order.service.deliveryTime} days</div>
                    
                    <div className="text-base-content/70">Revisions:</div>
                    <div className="font-medium text-right">{order.service.revisions}</div>
                    
                    <div className="text-base-content/70">Order Date:</div>
                    <div className="font-medium text-right">{new Date(order.createdAt).toLocaleDateString()}</div>
                    
                    {order.startDate && (
                      <>
                        <div className="text-base-content/70">Started On:</div>
                        <div className="font-medium text-right">{new Date(order.startDate).toLocaleDateString()}</div>
                      </>
                    )}
                    
                    {order.status === "completed" && order.completionDate && (
                      <>
                        <div className="text-base-content/70">Completed On:</div>
                        <div className="font-medium text-right">{new Date(order.completionDate).toLocaleDateString()}</div>
                      </>
                    )}
                    
                    {order.status === "completed" && (
                      <>
                        <div className="text-base-content/70">Total Days:</div>
                        <div className="font-medium text-right">
                          {Math.ceil((new Date(order.completionDate) - new Date(order.startDate || order.createdAt)) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* People Card */}
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  People
                </h2>
                
                <div className="divider my-0"></div>
                
                {/* Freelancer info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar">
                    <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={getProfileImage(order.freelancer)} alt={`${order.freelancer.firstName} ${order.freelancer.lastName}`} />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{order.freelancer.firstName} {order.freelancer.lastName}</div>
                    <div className="text-sm text-base-content/70 flex items-center gap-1">
                      <span className="badge badge-sm">Freelancer</span>
                      {order.freelancer.location && (
                        <span>• {order.freelancer.location}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Client info */}
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-12 rounded-full ring ring-offset-base-100 ring-offset-2">
                      <img src={getProfileImage(order.client)} alt={`${order.client.firstName} ${order.client.lastName}`} />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{order.client.firstName} {order.client.lastName}</div>
                    <div className="text-sm text-base-content/70 flex items-center gap-1">
                      <span className="badge badge-sm">Client</span>
                      {order.client.location && (
                        <span>• {order.client.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {payment && <PaymentSummary order={order} payment={payment} />}
            
            {/* Payment Actions */}
            {user.id === order.client._id && order.paymentStatus === "unpaid" && (
              <div className="card bg-base-100 shadow-lg mb-6">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Required
                  </h2>
                  
                  <div className="alert alert-warning mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Please complete payment to activate this order</span>
                  </div>
                  
                  <Link
                    to={`/orders/${order._id}/payment`}
                    className="btn btn-primary btn-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Pay Now (${order.price})
                  </Link>
                </div>
              </div>
            )}
            
            {/* Freelancer Payment Setup Warning */}
            {user.id === order.freelancer._id &&
              order.status === "completed" &&
              order.paymentStatus === "paid" &&
              !user.stripeConnectId && (
                <div className="card bg-base-100 shadow-lg mb-6">
                  <div className="card-body">
                    <div className="alert alert-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <span className="font-bold block mb-1">Payment Account Required</span>
                        <span className="block mb-3">You have a pending payment but haven't set up your payment account yet.</span>
                        <Link to="/payment-setup" className="btn btn-sm btn-primary">
                          Set Up Payment Account
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Messages and Requirements */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            {/* Requirements Card */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Project Requirements
                </h2>
                
                <div className="divider my-0"></div>

                <div className="bg-base-200 p-4 rounded-xl whitespace-pre-wrap">
                  {order.requirements || "No specific requirements provided."}
                </div>
              </div>
            </div>

            {/* Messages Card */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-0">
                <div className="px-6 pt-6 pb-2 border-b border-base-200">
                  <h2 className="card-title flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </h2>
                </div>

                {/* Message List */}
                <div 
                  className="p-6 overflow-y-auto flex-grow" 
                  style={{ maxHeight: "400px", minHeight: "400px" }}
                  ref={messageListRef}
                >
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender._id === user.id || message.sender === user.id;
                        const sender = isCurrentUser 
                          ? user 
                          : message.sender._id === order.freelancer._id || message.sender === order.freelancer._id
                            ? order.freelancer
                            : order.client;
                        
                        return (
                          <div
                            key={index}
                            className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
                          >
                            <div className="chat-image avatar">
                              <div className="w-10 rounded-full">
                                <img 
                                  src={getProfileImage(sender)} 
                                  alt={`${sender.firstName} ${sender.lastName}`}
                                />
                              </div>
                            </div>
                            <div className="chat-header">
                              {sender.firstName} {sender.lastName}
                              <time className="text-xs opacity-50 ml-1">
                                {new Intl.DateTimeFormat('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(new Date(message.timestamp))}
                              </time>
                            </div>
                            <div className={`chat-bubble ${isCurrentUser ? "chat-bubble-primary" : ""} break-words`}>
                              {message.content}
                            </div>
                            <div className="chat-footer opacity-50">
                              {new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric'
                              }).format(new Date(message.timestamp))}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 text-base-content/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No messages yet</p>
                      <p className="max-w-sm">
                        Send a message to start the conversation about this order.
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-base-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      rows="1"
                      placeholder="Type your message..."
                      className="textarea textarea-bordered flex-grow resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={messageLoading || order.status === "cancelled"}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) handleSendMessage(e);
                        }
                      }}
                    ></textarea>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={messageLoading || !newMessage.trim() || order.status === "cancelled"}
                    >
                      {messageLoading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                  {order.status === "cancelled" && (
                    <div className="text-center text-sm text-error mt-2">
                      This order has been cancelled. Messaging is disabled.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Review Section */}
            {order.status === "completed" && user.id === order.client._id && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Review
                  </h2>
                  
                  <div className="divider my-0"></div>
                  
                  {order.isReviewable ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="rating rating-lg mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            name="rating-preview"
                            className="mask mask-star-2 bg-orange-400"
                            checked={star === 5}
                            readOnly
                          />
                        ))}
                      </div>
                      <h3 className="font-bold text-lg mb-2">How was your experience?</h3>
                      <p className="text-base-content/70 mb-6 max-w-md">
                        Your review helps other clients make better decisions and provides valuable feedback to the freelancer.
                      </p>
                      <button
                        className="btn btn-primary btn-wide"
                        onClick={() => setShowReviewModal(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Leave a Review
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-success">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-bold">Thank you for your review!</h3>
                        <div className="text-xs">You've already submitted a review for this service.</div>
                      </div>
                      <Link to={`/services/${order.service._id}`} className="btn btn-sm">
                        View Service
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img src={getProfileImage(order.freelancer)} alt={`${order.freelancer.firstName} ${order.freelancer.lastName}`} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-2xl">Review your experience</h3>
                <p className="text-base-content/70">
                  with {order.freelancer.firstName} {order.freelancer.lastName} for "{order.service.title}"
                </p>
              </div>
            </div>
            
            <div className="divider"></div>
            
            {reviewError && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{reviewError}</span>
              </div>
            )}
            
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              {/* Rating Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-lg">How would you rate this service?</span>
                </label>
                
                <div className="bg-base-200 rounded-box p-6">
                  <div className="flex flex-col items-center">
                    <div className="rating rating-lg gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          name="rating"
                          className="mask mask-star-2 bg-orange-400"
                          checked={reviewData.rating === star}
                          onChange={() => setReviewData({ ...reviewData, rating: star })}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <span className="font-semibold text-lg">
                        {reviewData.rating === 1 && "Poor"}
                        {reviewData.rating === 2 && "Below Average"}
                        {reviewData.rating === 3 && "Average"}
                        {reviewData.rating === 4 && "Good"}
                        {reviewData.rating === 5 && "Excellent"}
                      </span>
                      
                      <p className="text-sm text-base-content/70 mt-1">
                        {reviewData.rating === 1 && "The service fell well below expectations"}
                        {reviewData.rating === 2 && "The service didn't quite meet expectations"}
                        {reviewData.rating === 3 && "The service was acceptable but not exceptional"}
                        {reviewData.rating === 4 && "The service exceeded expectations in many ways"}
                        {reviewData.rating === 5 && "The service was outstanding in every aspect"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-lg">Share your experience</span>
                  <span className="label-text-alt">Min. 10 characters</span>
                </label>
                
                <textarea
                  className="textarea textarea-bordered h-40 w-full text-base p-4 focus:border-primary"
                  placeholder={reviewData.comment ? "" : "• Was the freelancer communicative and responsive?\n• Was the work delivered on time and as expected?\n• Did the final result meet your requirements?\n• Would you recommend this service to others?"}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                ></textarea>
                
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-base-content/70">
                    Be honest and helpful to the community
                  </span>
                  <span className={`text-xs ${reviewData.comment.length < 10 ? "text-error" : "text-success"}`}>
                    {reviewData.comment.length} / 10+ characters
                  </span>
                </div>
              </div>

              {/* Review Privacy */}
              <div className="bg-base-200 p-4 rounded-box">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm">
                      Your review will be public and associated with your name. It will help other clients make informed decisions and provide feedback to the freelancer to improve their services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-action border-t pt-4">
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
                  disabled={reviewLoading || reviewData.comment.trim().length < 10}
                >
                  {reviewLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <label className="modal-backdrop" onClick={() => setShowReviewModal(false)}></label>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;