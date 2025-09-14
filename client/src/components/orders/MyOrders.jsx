import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/orders?status=${filter}`, {
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, filter]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-warning">
          Please login to view your orders
        </div>
      </div>
    );
  }

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
      <h1 className="text-3xl font-bold mb-8">
        {user.role === "client" ? "My Orders" : "Client Orders"}
      </h1>

      {/* Filter tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${filter === "all" ? "tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`tab ${filter === "pending" ? "tab-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`tab ${filter === "accepted" ? "tab-active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          Accepted
        </button>
        <button
          className={`tab ${filter === "in_progress" ? "tab-active" : ""}`}
          onClick={() => setFilter("in_progress")}
        >
          In Progress
        </button>
        <button
          className={`tab ${filter === "completed" ? "tab-active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`tab ${filter === "cancelled" ? "tab-active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {user.role === "freelancer" && !user.stripeConnectId && (
        <div className="alert alert-warning mb-6">
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
          <span>
            You need to set up your payment account to receive payments.
          </span>
          <Link to="/payment-setup" className="btn btn-sm btn-primary">
            Set Up Now
          </Link>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="alert alert-info">
            You don't have any {filter !== "all" ? filter : ""} orders yet.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Service</th>
                <th>{user.role === "client" ? "Freelancer" : "Client"}</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          {order.service.images && order.service.images[0] ? (
                            <img
                              src={order.service.images[0].url}
                              alt={order.service.title}
                            />
                          ) : (
                            <div className="bg-base-300 w-full h-full flex items-center justify-center">
                              <span>No img</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{order.service.title}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.role === "client"
                      ? `${order.freelancer.firstName} ${order.freelancer.lastName}`
                      : `${order.client.firstName} ${order.client.lastName}`}
                  </td>
                  <td>${order.price}</td>
                  <td>
                    <div
                      className={`badge ${getStatusBadgeClass(order.status)}`}
                    >
                      {order.status}
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-sm btn-primary"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
