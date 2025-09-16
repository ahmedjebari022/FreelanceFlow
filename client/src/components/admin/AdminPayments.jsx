import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/payments?page=${page}&limit=10`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      if (payoutStatusFilter) {
        url += `&payoutStatus=${payoutStatusFilter}`;
      }

      url += `&sortBy=${sortField}&order=${sortOrder}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      setPayments(response.data.payments);
      setTotalPages(response.data.pagination.pages);
      setTotalPayments(response.data.pagination.total);
      setCurrentPage(response.data.pagination.page);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage, statusFilter, payoutStatusFilter, sortField, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleReleaseClick = (payment) => {
    setSelectedPayment(payment);
    setIsReleaseModalOpen(true);
  };

  const handleReleasePayment = async () => {
    try {
      setReleaseLoading(true);
      await axios.post(`/api/payments/release/${selectedPayment._id}`, {}, {
        withCredentials: true
      });
      
      // Update the payment in the list
      const updatedPayments = payments.map(payment => {
        if (payment._id === selectedPayment._id) {
          return {
            ...payment,
            payoutStatus: "completed",
            status: "transferred"
          };
        }
        return payment;
      });
      
      setPayments(updatedPayments);
      setIsReleaseModalOpen(false);
      setSelectedPayment(null);
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

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Payments Management</h1>

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
                placeholder="Search by payment ID or order ID..."
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
            <option value="">All Payment Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="transferred">Transferred</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="select select-bordered"
            value={payoutStatusFilter}
            onChange={(e) => {
              setPayoutStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Payout Statuses</option>
            <option value="completed">Released</option>
            <option value="pending">Pending</option>
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

      {/* Payment count and pagination info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {payments.length} of {totalPayments} payments
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

      {/* Payments Table */}
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
                  onClick={() => handleSort("order")}
                >
                  Order {getSortIcon("order")}
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
                  onClick={() => handleSort("amount")}
                >
                  Amount {getSortIcon("amount")}
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
                  onClick={() => handleSort("payoutStatus")}
                >
                  Payout {getSortIcon("payoutStatus")}
                </button>
              </th>
              <th>
                <button
                  className="flex items-center"
                  onClick={() => handleSort("createdAt")}
                >
                  Date {getSortIcon("createdAt")}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="font-mono text-xs">
                  {payment._id.substring(0, 8)}...
                </td>
                <td>
                  {payment.order ? (
                    <Link
                      to={`/admin/orders/${payment.order._id}`}
                      className="hover:underline"
                    >
                      #{payment.order._id.substring(0, 8)}...
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {payment.order?.client ? (
                    <Link
                      to={`/admin/users/${payment.order.client._id}`}
                      className="hover:underline"
                    >
                      {payment.order.client.firstName} {payment.order.client.lastName}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {payment.order?.freelancer ? (
                    <Link
                      to={`/admin/users/${payment.order.freelancer._id}`}
                      className="hover:underline"
                    >
                      {payment.order.freelancer.firstName} {payment.order.freelancer.lastName}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{getStatusBadge(payment.status)}</td>
                <td>{getPayoutStatusBadge(payment.payoutStatus)}</td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/payments/${payment._id}`}
                        className="btn btn-xs btn-outline"
                      >
                        View
                      </Link>
                      {payment.status === "succeeded" && 
                       payment.payoutStatus === "pending" && 
                       payment.order?.freelancer?.stripeConnectId && (
                        <button
                          className="btn btn-xs btn-success btn-outline"
                          onClick={() => handleReleaseClick(payment)}
                        >
                          Release
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
      {payments.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-xl font-semibold mb-2">No payments found</div>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Release Payment Modal */}
      {isReleaseModalOpen && selectedPayment && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Release Payment to Freelancer</h3>
            <p className="py-4">
              Are you sure you want to release the payment of{" "}
              <span className="font-bold">
                {formatCurrency(selectedPayment.freelancerAmount)}
              </span>{" "}
              to{" "}
              <span className="font-bold">
                {selectedPayment.order.freelancer.firstName}{" "}
                {selectedPayment.order.freelancer.lastName}
              </span>
              ?
            </p>
            
            <div className="alert alert-info mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>This action cannot be undone. The funds will be transferred to the freelancer's connected account.</span>
            </div>
            
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setIsReleaseModalOpen(false);
                  setSelectedPayment(null);
                }}
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

export default AdminPayments;