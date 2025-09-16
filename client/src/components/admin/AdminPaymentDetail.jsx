import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminPaymentDetail = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/payments/${paymentId}`, {
          withCredentials: true,
        });
        setPayment(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("Failed to load payment details");
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const handleReleasePayment = async () => {
    try {
      setReleaseLoading(true);
      await axios.post(`/api/payments/release/${paymentId}`, {}, {
        withCredentials: true
      });
      
      // Refetch payment details after release
      const response = await axios.get(`/api/admin/payments/${paymentId}`, {
        withCredentials: true,
      });
      
      setPayment(response.data);
      setShowReleaseModal(false);
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
      case "succeeded":
        return <span className="badge badge-success">Succeeded</span>;
      case "transferred":
        return <span className="badge badge-info">Transferred</span>;
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
      case "failed":
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPayoutStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="badge badge-success">Released</span>;
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
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

  if (!payment) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Payment not found</span>
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
              <li><Link to="/admin/payments">Payments</Link></li>
              <li>Payment #{payment._id.substring(0, 8)}</li>
            </ul>
          </div>
          <h1 className="text-3xl font-bold">Payment Details</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/payments")}
          >
            Back to Payments
          </button>
          
          {payment.status === "succeeded" && 
           payment.payoutStatus === "pending" && 
           payment.order?.freelancer?.stripeConnectId && (
            <button
              className="btn btn-success"
              onClick={() => setShowReleaseModal(true)}
            >
              Release Payment
            </button>
          )}
        </div>
      </div>
      
      {/* Payment details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Payment Information */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Payment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="font-semibold block">Payment ID:</span>
                  <span className="font-mono">{payment._id}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Created On:</span>
                  <span>{new Date(payment.createdAt).toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Total Amount:</span>
                  <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Currency:</span>
                  <span className="uppercase">{payment.currency || "EUR"}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Platform Fee:</span>
                  <span>{formatCurrency(payment.platformFee)}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Freelancer Amount:</span>
                  <span className="font-semibold">{formatCurrency(payment.freelancerAmount)}</span>
                </div>
                
                <div>
                  <span className="font-semibold block">Payment Status:</span>
                  <div className="mt-1">{getStatusBadge(payment.status)}</div>
                </div>
                
                <div>
                  <span className="font-semibold block">Payout Status:</span>
                  <div className="mt-1">{getPayoutStatusBadge(payment.payoutStatus)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stripe Information */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Stripe Information</h2>
              
              <div className="overflow-x-auto mt-4">
                <table className="table w-full">
                  <tbody>
                    <tr>
                      <td className="font-semibold">Payment Intent ID</td>
                      <td className="font-mono text-xs">{payment.stripePaymentIntentId}</td>
                    </tr>
                    {payment.stripeChargeId && (
                      <tr>
                        <td className="font-semibold">Charge ID</td>
                        <td className="font-mono text-xs">{payment.stripeChargeId}</td>
                      </tr>
                    )}
                    {payment.payoutId && (
                      <tr>
                        <td className="font-semibold">Payout ID</td>
                        <td className="font-mono text-xs">{payment.payoutId}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {payment.status === "succeeded" && payment.payoutStatus === "pending" && (
                <div className="alert alert-info mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>Payment has been received but not yet released to the freelancer.</span>
                </div>
              )}
              
              {payment.payoutStatus === "completed" && (
                <div className="alert alert-success mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Payment has been successfully released to the freelancer.</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div>
          {/* Order Information */}
          {payment.order && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title">Order Information</h2>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="font-semibold block">Order ID:</span>
                    <Link 
                      to={`/admin/orders/${payment.order._id}`} 
                      className="font-mono text-xs link link-primary"
                    >
                      {payment.order._id}
                    </Link>
                  </div>
                  
                  {payment.order.service && (
                    <div>
                      <span className="font-semibold block">Service:</span>
                      <Link 
                        to={`/admin/services/${payment.order.service._id}`} 
                        className="link link-primary"
                      >
                        {payment.order.service.title}
                      </Link>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-semibold block">Order Status:</span>
                    <span className={`badge ${
                      payment.order.status === "completed" ? "badge-success" :
                      payment.order.status === "cancelled" ? "badge-error" :
                      payment.order.status === "in_progress" ? "badge-info" :
                      payment.order.status === "accepted" ? "badge-primary" :
                      "badge-warning"
                    }`}>
                      {payment.order.status}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/admin/orders/${payment.order._id}`} 
                    className="btn btn-outline btn-sm w-full mt-2"
                  >
                    View Order Details
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Client Information */}
          {payment.order?.client && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title">Client Information</h2>
                
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        <img
                          src={`https://ui-avatars.com/api/?name=${payment.order.client.firstName}+${payment.order.client.lastName}&size=64`}
                          alt={`${payment.order.client.firstName} ${payment.order.client.lastName}`}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link to={`/admin/users/${payment.order.client._id}`} className="hover:underline">
                          {payment.order.client.firstName} {payment.order.client.lastName}
                        </Link>
                      </h3>
                      <div className="badge badge-accent">Client</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold block">Email:</span>
                      <span>{payment.order.client.email}</span>
                    </div>
                    
                    <Link to={`/admin/users/${payment.order.client._id}`} className="btn btn-outline btn-sm w-full mt-2">
                      View Client Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Freelancer Information */}
          {payment.order?.freelancer && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Freelancer Information</h2>
                
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        <img
                          src={`https://ui-avatars.com/api/?name=${payment.order.freelancer.firstName}+${payment.order.freelancer.lastName}&size=64`}
                          alt={`${payment.order.freelancer.firstName} ${payment.order.freelancer.lastName}`}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link to={`/admin/users/${payment.order.freelancer._id}`} className="hover:underline">
                          {payment.order.freelancer.firstName} {payment.order.freelancer.lastName}
                        </Link>
                      </h3>
                      <div className="badge badge-primary">Freelancer</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold block">Email:</span>
                      <span>{payment.order.freelancer.email}</span>
                    </div>
                    
                    <div>
                      <span className="font-semibold block">Payment Account:</span>
                      <span>{payment.order.freelancer.stripeConnectId ? "Set up" : "Not set up"}</span>
                    </div>
                    
                    <Link to={`/admin/users/${payment.order.freelancer._id}`} className="btn btn-outline btn-sm w-full mt-2">
                      View Freelancer Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Release Payment Modal */}
      {showReleaseModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Release Payment to Freelancer</h3>
            <p className="py-4">
              Are you sure you want to release the payment of {formatCurrency(payment.freelancerAmount)} to {payment.order.freelancer.firstName} {payment.order.freelancer.lastName}?
            </p>
            
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>This action cannot be undone. The funds will be transferred to the freelancer's connected account.</span>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowReleaseModal(false)}
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

export default AdminPaymentDetail;