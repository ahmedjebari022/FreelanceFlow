import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showReleasePaymentModal, setShowReleasePaymentModal] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/orders/${orderId}`, {
          withCredentials: true,
        });
        
        setOrder(response.data.order);
        setPayment(response.data.payment || null);
        setMessages(response.data.messages || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleStatusChangeClick = (status) => {
    setNewStatus(status);
    setIsStatusChangeModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.put(
        `/api/admin/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        { withCredentials: true }
      );
      
      setOrder(response.data);
      setIsStatusChangeModalOpen(false);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    }
  };

  const handleReleasePayment = async () => {
    try {
      setReleaseLoading(true);
      await axios.post(`/api/payments/release/${payment._id}`, {}, {
        withCredentials: true
      });
      
      // Refetch payment details
      const paymentResponse = await axios.get(`/api/payments/order/${orderId}`, {
        withCredentials: true
      });
      
      setPayment(paymentResponse.data);
      setShowReleasePaymentModal(false);
      setReleaseLoading(false);
    } catch (err) {
      console.error("Error releasing payment:", err);
      setError("Failed to release payment");
      setReleaseLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
      case "accepted":
        return <span className="badge badge-info">Accepted</span>;
      case "in_progress":
        return <span className="badge badge-primary">In Progress</span>;
      case "completed":
        return <span className="badge badge-success">Completed</span>;
      case "cancelled":
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="badge badge-success">Paid</span>;
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
      case "unpaid":
        return <span className="badge badge-ghost">Unpaid</span>;
      case "refunded":
        return <span className="badge badge-error">Refunded</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Order not found</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link to="/admin">Dashboard</Link></li>
              <li><Link to="/admin/orders">Orders</Link></li>
              <li>Order #{order._id.substring(0, 8)}</li>
            </ul>
          </div>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/orders")}
          >
            Back to Orders
          </button>
          
          {order.status !== "cancelled" && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-primary">
                Change Status
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                {order.status !== "pending" && (
                  <li>
                    <button onClick={() => handleStatusChangeClick("pending")}>
                      Pending
                    </button>
                  </li>
                )}
                {order.status !== "accepted" && (
                  <li>
                    <button onClick={() => handleStatusChangeClick("accepted")}>
                      Accepted
                    </button>
                  </li>
                )}
                {order.status !== "in_progress" && (
                  <li>
                    <button onClick={() => handleStatusChangeClick("in_progress")}>
                      In Progress
                    </button>
                  </li>
                )}
                {order.status !== "completed" && (
                  <li>
                    <button onClick={() => handleStatusChangeClick("completed")}>
                      Completed
                    </button>
                  </li>
                )}
                {order.status !== "cancelled" && (
                  <li>
                    <button onClick={() => handleStatusChangeClick("cancelled")}>
                      Cancelled
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {payment && 
            payment.status === "succeeded" && 
            payment.payoutStatus === "pending" && (
            <button
              className="btn btn-success"
              onClick={() => setShowReleasePaymentModal(true)}
            >
              Release Payment
            </button>
          )}
        </div>
      </div>
      
      {/* Order details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Order Details */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="font-semibold block">Order ID:</span>
                  <span className="font-mono">{order._id}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Created On:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Service:</span>
                  <span>
                    <Link to={`/admin/services/${order.service._id}`} className="link link-primary">
                      {order.service.title}
                    </Link>
                  </span>
                </div>
                
                <div>
                  <span className="font-semibold block">Price:</span>
                  <span className="text-lg font-bold">{formatCurrency(order.price)}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Status:</span>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                
                <div>
                  <span className="font-semibold block">Payment Status:</span>
                  <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
                </div>
                
                {order.startDate && (
                  <div>
                    <span className="font-semibold block">Started On:</span>
                    <span>{new Date(order.startDate).toLocaleString()}</span>
                  </div>
                )}
                
                {order.completionDate && (
                  <div>
                    <span className="font-semibold block">Completed On:</span>
                    <span>{new Date(order.completionDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Client Requirements */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Client Requirements</h2>
              <div className="p-4 bg-base-200 rounded-lg mt-4">
                <p className="whitespace-pre-wrap">{order.requirements}</p>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Order Messages</h2>
              
              {messages.length > 0 ? (
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto p-2">
                  {messages.map((message, index) => (
                    <div key={index} className="chat chat-start">
                      <div className="chat-header">
                        {message.sender && message.sender.firstName ? 
                          `${message.sender.firstName} ${message.sender.lastName}` : 
                          "User"}
                        <time className="text-xs opacity-50 ml-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </time>
                      </div>
                      <div className="chat-bubble">{message.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>No messages have been exchanged for this order yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div>
          {/* Client Info */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Client Information</h2>
              
              <div className="mt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${order.client.firstName}+${order.client.lastName}&size=64`}
                        alt={`${order.client.firstName} ${order.client.lastName}`}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      <Link to={`/admin/users/${order.client._id}`} className="hover:underline">
                        {order.client.firstName} {order.client.lastName}
                      </Link>
                    </h3>
                    <div className="badge badge-accent">Client</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold block">Email:</span>
                    <span>{order.client.email}</span>
                  </div>
                  
                  <Link to={`/admin/users/${order.client._id}`} className="btn btn-outline btn-sm w-full mt-4">
                    View Client Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Freelancer Info */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Freelancer Information</h2>
              
              <div className="mt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${order.freelancer.firstName}+${order.freelancer.lastName}&size=64`}
                        alt={`${order.freelancer.firstName} ${order.freelancer.lastName}`}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      <Link to={`/admin/users/${order.freelancer._id}`} className="hover:underline">
                        {order.freelancer.firstName} {order.freelancer.lastName}
                      </Link>
                    </h3>
                    <div className="badge badge-primary">Freelancer</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold block">Email:</span>
                    <span>{order.freelancer.email}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold block">Payment Account:</span>
                    <span>{order.freelancer.stripeConnectId ? "Set up" : "Not set up"}</span>
                  </div>
                  
                  <Link to={`/admin/users/${order.freelancer._id}`} className="btn btn-outline btn-sm w-full mt-4">
                    View Freelancer Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Info */}
          {payment ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Payment Information</h2>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="font-semibold block">Payment Status:</span>
                    <div className="mt-1">
                      <span className={`badge ${payment.status === "succeeded" ? "badge-success" : payment.status === "pending" ? "badge-warning" : "badge-error"}`}>
                        {payment.status === "succeeded" ? "Succeeded" : payment.status === "pending" ? "Pending" : "Failed"}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-semibold block">Payout Status:</span>
                    <div className="mt-1">
                      <span className={`badge ${payment.payoutStatus === "completed" ? "badge-success" : "badge-warning"}`}>
                        {payment.payoutStatus === "completed" ? "Released" : "Pending"}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-semibold block">Total Amount:</span>
                    <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold block">Platform Fee:</span>
                    <span>{formatCurrency(payment.platformFee)}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold block">Freelancer Amount:</span>
                    <span className="text-lg font-bold">{formatCurrency(payment.freelancerAmount)}</span>
                  </div>
                  
                  {payment.stripePaymentIntentId && (
                    <div>
                      <span className="font-semibold block">Payment Intent ID:</span>
                      <span className="font-mono text-xs">{payment.stripePaymentIntentId}</span>
                    </div>
                  )}
                  
                  {payment.payoutId && (
                    <div>
                      <span className="font-semibold block">Payout ID:</span>
                      <span className="font-mono text-xs">{payment.payoutId}</span>
                    </div>
                  )}
                  
                  {payment.createdAt && (
                    <div>
                      <span className="font-semibold block">Payment Date:</span>
                      <span>{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {payment.status === "succeeded" && payment.payoutStatus === "pending" && (
                    <button
                      className="btn btn-success btn-sm w-full mt-4"
                      onClick={() => setShowReleasePaymentModal(true)}
                    >
                      Release Payment to Freelancer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Payment Information</h2>
                
                <div className="alert alert-warning mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>No payment has been made for this order yet</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Change Modal */}
      {isStatusChangeModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Order Status</h3>
            <p className="py-4">
              Are you sure you want to change the status of this order from{" "}
              <span className="font-semibold">{order.status}</span> to{" "}
              <span className="font-semibold">{newStatus}</span>?
            </p>
            
            {newStatus === "completed" && (
              <div className="alert alert-info mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Marking as complete will allow the client to review the service and if payment is made, start the payment release process.</span>
              </div>
            )}
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setIsStatusChangeModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Release Payment Modal */}
      {showReleasePaymentModal && payment && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Release Payment to Freelancer</h3>
            <p className="py-4">
              Are you sure you want to release the payment of {formatCurrency(payment.freelancerAmount)} to {order.freelancer.firstName} {order.freelancer.lastName}?
            </p>
            
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>This action cannot be undone. The funds will be transferred to the freelancer's connected account.</span>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowReleasePaymentModal(false)}
                disabled={releaseLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success"
                onClick={handleReleasePayment}
                disabled={releaseLoading}
              >
                {releaseLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Release Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;