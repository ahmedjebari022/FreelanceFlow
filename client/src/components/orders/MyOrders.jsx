import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/orders?status=${filter}`, {
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      navigate("/login");
    }
  }, [user, filter, navigate]);

  // Calculate order counts directly from the fetched orders
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      accepted: orders.filter(o => o.status === "accepted").length,
      in_progress: orders.filter(o => o.status === "in_progress").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };
    
    // If we're filtering, the "all" count might not be accurate
    // Only trust the "all" count if we're on the "all" filter
    if (filter !== "all") {
      counts.all = null; // We don't know the total without a separate API call
    }
    
    return counts;
  };

  const orderStats = getOrderCounts();

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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "accepted":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "in_progress":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        );
      case "completed":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li className="text-primary font-medium">My Orders</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Header Section */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user?.role === "client" ? "My Orders" : "Client Orders"}
                </h1>
                <p className="text-base-content/70 mt-1">
                  Manage and track all your {filter !== "all" ? filter : ""} orders
                </p>
              </div>

              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="input input-bordered"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button className="btn btn-square">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Using data calculated from current orders */}
        <div className="mb-6">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="stat-title">Total Orders</div>
              <div className="stat-value text-primary">{orderStats.all || "—"}</div>
              <div className="stat-desc">All time</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{orderStats.pending}</div>
              <div className="stat-desc">Awaiting action</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-info">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-title">Active</div>
              <div className="stat-value text-info">{orderStats.accepted + orderStats.in_progress}</div>
              <div className="stat-desc">In progress or accepted</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{orderStats.completed}</div>
              <div className="stat-desc">Successfully delivered</div>
            </div>
          </div>
        </div>

        {user?.role === "freelancer" && !user.stripeConnectId && (
          <div className="card bg-base-100 shadow-lg mb-6 border-warning border-l-4">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="bg-warning/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Payment Account Setup Required</h3>
                  <p className="text-base-content/70">
                    You need to set up your payment account to receive payments from clients.
                  </p>
                </div>
                <Link to="/payment-setup" className="btn btn-warning">
                  Set Up Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <div className="tabs tabs-boxed bg-base-200 p-2 m-3 rounded-xl flex flex-wrap">
                <button
                  className={`tab flex-1 ${filter === "all" ? "tab-active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  <span>All</span>
                  {filter === "all" && <span className="badge ml-2">{orders.length}</span>}
                </button>
                <button
                  className={`tab flex-1 ${filter === "pending" ? "tab-active" : ""}`}
                  onClick={() => setFilter("pending")}
                >
                  <span className="flex items-center">
                    {getStatusIcon("pending")}
                    <span>Pending</span>
                  </span>
                  {filter === "pending" && <span className="badge badge-warning ml-2">{orders.length}</span>}
                </button>
                <button
                  className={`tab flex-1 ${filter === "accepted" ? "tab-active" : ""}`}
                  onClick={() => setFilter("accepted")}
                >
                  <span className="flex items-center">
                    {getStatusIcon("accepted")}
                    <span>Accepted</span>
                  </span>
                  {filter === "accepted" && <span className="badge badge-info ml-2">{orders.length}</span>}
                </button>
                <button
                  className={`tab flex-1 ${filter === "in_progress" ? "tab-active" : ""}`}
                  onClick={() => setFilter("in_progress")}
                >
                  <span className="flex items-center">
                    {getStatusIcon("in_progress")}
                    <span>In Progress</span>
                  </span>
                  {filter === "in_progress" && <span className="badge badge-primary ml-2">{orders.length}</span>}
                </button>
                <button
                  className={`tab flex-1 ${filter === "completed" ? "tab-active" : ""}`}
                  onClick={() => setFilter("completed")}
                >
                  <span className="flex items-center">
                    {getStatusIcon("completed")}
                    <span>Completed</span>
                  </span>
                  {filter === "completed" && <span className="badge badge-success ml-2">{orders.length}</span>}
                </button>
                <button
                  className={`tab flex-1 ${filter === "cancelled" ? "tab-active" : ""}`}
                  onClick={() => setFilter("cancelled")}
                >
                  <span className="flex items-center">
                    {getStatusIcon("cancelled")}
                    <span>Cancelled</span>
                  </span>
                  {filter === "cancelled" && <span className="badge badge-error ml-2">{orders.length}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <div className="text-6xl text-base-content/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="card-title text-2xl mb-2">No Orders Found</h2>
              <p className="text-base-content/70 mb-6">
                {searchTerm 
                  ? "No orders match your search criteria" 
                  : `You don't have any ${filter !== "all" ? filter : ""} orders yet.`}
              </p>
              {searchTerm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              ) : (
                <Link to="/categories" className="btn btn-primary">
                  Browse Services
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Responsive card view instead of table */}
            {filteredOrders.map((order) => (
              <div key={order._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="card-body p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Order Status Indicator */}
                    <div className={`lg:col-span-1 flex lg:flex-col justify-center items-center p-4 lg:border-r border-base-300`}>
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === "pending" ? "bg-warning" :
                        order.status === "accepted" ? "bg-info" :
                        order.status === "in_progress" ? "bg-primary" :
                        order.status === "completed" ? "bg-success" : "bg-error"
                      }`}></div>
                      <div className="lg:h-full w-px lg:w-full lg:h-px bg-base-300 mx-2 lg:mx-0 lg:my-2"></div>
                      <div className={`w-3 h-3 rounded-full ${
                        order.paymentStatus === "paid" ? "bg-success" :
                        order.paymentStatus === "pending" ? "bg-warning" : "bg-error"
                      }`}></div>
                    </div>

                    {/* Order Info */}
                    <div className="lg:col-span-8 p-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-16 rounded">
                            {order.service.images && order.service.images[0] ? (
                              <img
                                src={order.service.images[0].url}
                                alt={order.service.title}
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-base-300 w-full h-full flex items-center justify-center text-xs">
                                No image
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="font-bold text-lg">
                              Order #{order.orderNumber}
                            </span>
                            <span className={`badge ${getStatusBadgeClass(order.status)} gap-1`}>
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                            </span>
                            <span className={`badge ${
                              order.paymentStatus === "paid" ? "badge-success" :
                              order.paymentStatus === "pending" ? "badge-warning" : "badge-error"
                            } gap-1`}>
                              {order.paymentStatus === "paid" ? "Paid" : 
                               order.paymentStatus === "pending" ? "Processing" : "Unpaid"}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold">{order.service.title}</h3>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm text-base-content/70">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {user?.role === "client"
                                ? `${order.freelancer.firstName} ${order.freelancer.lastName}`
                                : `${order.client.firstName} ${order.client.lastName}`}
                            </div>

                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(order.createdAt)}
                            </div>

                            {order.deliveryDue && (
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Due {formatDate(order.deliveryDue)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-3 flex flex-col justify-center items-center p-4 bg-base-200 lg:bg-base-100 lg:border-l border-base-300">
                      <div className="text-center mb-2">
                        <div className="text-3xl font-bold text-primary">${order.price}</div>
                        <div className="text-xs text-base-content/60">Order Total</div>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-primary btn-block"
                      >
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {order.paymentStatus === "unpaid" && user?.role === "client" && (
                        <Link
                          to={`/orders/${order._id}/payment`}
                          className="btn btn-outline btn-block mt-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;