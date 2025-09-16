import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/users/${userId}`, {
          withCredentials: true,
        });
        
        setUser(response.data.user);
        setServices(response.data.services || []);
        setOrders(response.data.orders || []);
        setPayments(response.data.payments || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

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
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>User not found</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Details</h1>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center mb-6">
              <div className="avatar mb-4">
                <div className="w-24 rounded-full">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&size=200`}
                    alt="User avatar"
                  />
                </div>
              </div>
              <h2 className="card-title text-2xl">{user.firstName} {user.lastName}</h2>
              <div className="badge badge-primary mt-2">{user.role}</div>
              <div className={`badge ${user.isActive ? "badge-success" : "badge-error"} mt-1`}>
                {user.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>
              {user.role === "freelancer" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Setup:</span>
                  <span>{user.stripeConnectId ? "Completed" : "Not Setup"}</span>
                </div>
              )}
            </div>

            <div className="card-actions justify-end mt-6">
              <Link to={`/admin/users/${user._id}/edit`} className="btn btn-primary btn-sm">
                Edit User
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title">Activity Overview</h3>
              
              <div className="stats shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Services</div>
                  <div className="stat-value">{services.length}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Orders</div>
                  <div className="stat-value">{orders.length}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Payments</div>
                  <div className="stat-value">{payments.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Tabs */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="tabs tabs-boxed">
                <a className="tab tab-active">Recent Orders</a>
                {user.role === "freelancer" && <a className="tab">Services</a>}
                <a className="tab">Payments</a>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="font-mono text-xs">{order._id.substring(0, 8)}...</td>
                        <td>
                          {order.service ? (
                            <>Service: {order.service.title}</>
                          ) : (
                            <>Order #{order._id.substring(0, 6)}</>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            order.status === "completed" ? "badge-success" :
                            order.status === "cancelled" ? "badge-error" :
                            order.status === "in_progress" ? "badge-info" :
                            "badge-warning"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/admin/orders/${order._id}`} className="btn btn-xs btn-outline">
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
        </div>
      </div>
    </div>
  );
};

export default UserDetails;