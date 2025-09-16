import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/orders?page=${page}&limit=10`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      url += `&sortBy=${sortField}&order=${sortOrder}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
      setTotalOrders(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter, sortField, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleStatusChangeClick = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setIsStatusChangeModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.put(
        `/api/admin/orders/${selectedOrder._id}/status`,
        {
          status: newStatus,
        },
        { withCredentials: true }
      );

      setOrders(
        orders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: response.data.status }
            : order
        )
      );
      setIsStatusChangeModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
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

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

      {/* Search and Filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="form-control flex-grow">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by order ID or requirements..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-square">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
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

      {/* Order count and pagination info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {orders.length} of {totalOrders} orders
        </p>
        <div className="btn-group">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button className="btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="btn btn-sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("_id")}
                >
                  ID {getSortIcon("_id")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("service")}
                >
                  Service {getSortIcon("service")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("client")}
                >
                  Client {getSortIcon("client")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("freelancer")}
                >
                  Freelancer {getSortIcon("freelancer")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("price")}
                >
                  Price {getSortIcon("price")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("status")}
                >
                  Status {getSortIcon("status")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("paymentStatus")}
                >
                  Payment {getSortIcon("paymentStatus")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("createdAt")}
                >
                  Created {getSortIcon("createdAt")}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono text-xs">
                  {order._id.substring(0, 8)}...
                </td>
                <td>
                  {order.service ? (
                    <Link
                      to={`/admin/services/${order.service._id}`}
                      className="hover:underline"
                    >
                      {order.service.title}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <Link
                    to={`/admin/users/${order.client._id}`}
                    className="hover:underline"
                  >
                    {order.client.firstName} {order.client.lastName}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/admin/users/${order.freelancer._id}`}
                    className="hover:underline"
                  >
                    {order.freelancer.firstName} {order.freelancer.lastName}
                  </Link>
                </td>
                <td>{formatCurrency(order.price)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="btn btn-xs btn-outline"
                      >
                        View
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== "cancelled" && (
                        <div className="dropdown dropdown-end">
                          <label
                            tabIndex={0}
                            className="btn btn-xs btn-outline"
                          >
                            Change Status
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            {order.status !== "pending" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChangeClick(order, "pending")
                                  }
                                >
                                  Pending
                                </button>
                              </li>
                            )}
                            {order.status !== "accepted" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChangeClick(order, "accepted")
                                  }
                                >
                                  Accepted
                                </button>
                              </li>
                            )}
                            {order.status !== "in_progress" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChangeClick(
                                      order,
                                      "in_progress"
                                    )
                                  }
                                >
                                  In Progress
                                </button>
                              </li>
                            )}
                            {order.status !== "completed" && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleStatusChangeClick(order, "completed")
                                  }
                                >
                                  Completed
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {order.status !== "cancelled" && (
                        <button
                          className="btn btn-xs btn-outline btn-error"
                          onClick={() =>
                            handleStatusChangeClick(order, "cancelled")
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-xl font-semibold mb-2">No orders found</div>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusChangeModalOpen && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Order Status</h3>
            <p className="py-4">
              Are you sure you want to change the status of order #{" "}
              <span className="font-mono">
                {selectedOrder._id.substring(0, 8)}...
              </span>{" "}
              from{" "}
              <span className="font-semibold">{selectedOrder.status}</span> to{" "}
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
                onClick={() => {
                  setIsStatusChangeModalOpen(false);
                  setSelectedOrder(null);
                }}
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
    </div>
  );
};

export default AdminOrders;