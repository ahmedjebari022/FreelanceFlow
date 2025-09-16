import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/stats", {
          withCredentials: true,
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load admin dashboard data");
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Users</h2>
            <p className="text-3xl font-bold">{stats?.userCount || 0}</p>
            <div className="text-sm text-gray-500">
              <span className="mr-3">
                Freelancers: {stats?.freelancerCount || 0}
              </span>
              <span>Clients: {stats?.clientCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Services</h2>
            <p className="text-3xl font-bold">{stats?.serviceCount || 0}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Orders</h2>
            <p className="text-3xl font-bold">{stats?.orderCount || 0}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Revenue</h2>
            <p className="text-3xl font-bold">
              {formatCurrency(stats?.revenue)}
            </p>
            <div className="text-sm text-gray-500">
              <span>Platform Fees: {formatCurrency(stats?.platformFees)}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Categories</h2>
            <p className="text-3xl font-bold">{stats?.categoryCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-sm">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Client</th>
                  <th>Freelancer</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td>{order.service?.title || "N/A"}</td>
                    <td>
                      {order.client?.firstName} {order.client?.lastName}
                    </td>
                    <td>
                      {order.freelancer?.firstName} {order.freelancer?.lastName}
                    </td>
                    <td>{formatCurrency(order.price)}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "completed"
                            ? "badge-success"
                            : order.status === "cancelled"
                            ? "badge-error"
                            : order.status === "in_progress"
                            ? "badge-info"
                            : order.status === "accepted"
                            ? "badge-primary"
                            : "badge-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="btn btn-xs btn-outline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Recent Payments</h2>
            <Link to="/admin/payments" className="btn btn-sm">
              View All
            </Link>
          </div>

          {stats?.recentPayments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentPayments?.map((payment) => (
                    <tr key={payment._id}>
                      <td className="font-mono text-xs">
                        {payment._id.substring(0, 8)}...
                      </td>
                      <td className="font-mono text-xs">
                        {payment.order?._id.substring(0, 8)}...
                      </td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === "succeeded"
                              ? "badge-success"
                              : payment.status === "pending"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {payment.status}
                        </span>
                        {payment.payoutStatus === "completed" && (
                          <span className="badge badge-info ml-1">Paid Out</span>
                        )}
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/admin/payments/${payment._id}`}
                          className="btn btn-xs btn-outline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No recent payments found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
