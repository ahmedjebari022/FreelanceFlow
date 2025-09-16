// New file: client/src/components/freelancer/EarningsDashboard.jsx
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const EarningsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        // Get a summary of earnings from the backend
        const response = await axios.get("/api/freelancer/earnings", {
          withCredentials: true,
        });
        setEarnings(response.data);

        // Get payment transactions
        const paymentsResponse = await axios.get(
          "/api/freelancer/transactions",
          {
            withCredentials: true,
          }
        );
        setTransactions(paymentsResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load earnings data");
        setLoading(false);
      }
    };

    if (user && user.role === "freelancer") {
      fetchEarnings();
    }
  }, [user]);

  if (!user || user.role !== "freelancer") {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-warning">
          Only freelancers can access earnings dashboard
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

  // Format currency
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Earnings Dashboard</h1>

      {!user.stripeConnectId && (
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
          <div>
            <span className="block">
              You need to set up your payment account to receive earnings.
            </span>
            <Link to="/payment-setup" className="btn btn-sm btn-primary mt-2">
              Set Up Payment Account
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Total Earnings</h2>
            <p className="text-3xl font-bold">
              {formatCurrency(earnings?.total || 0)}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pending</h2>
            <p className="text-3xl font-bold">
              {formatCurrency(earnings?.pending || 0)}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Available</h2>
            <p className="text-3xl font-bold">
              {formatCurrency(earnings?.available || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Recent Transactions</h2>

          {transactions.length === 0 ? (
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
              <span>No transactions found</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          to={`/orders/${transaction.order._id}`}
                          className="link link-primary"
                        >
                          Order #{transaction.order._id.substring(0, 8)}
                        </Link>
                      </td>
                      <td>{formatCurrency(transaction.freelancerAmount)}</td>
                      <td>
                        <span
                          className={`badge ${
                            transaction.payoutStatus === "completed"
                              ? "badge-success"
                              : transaction.status === "succeeded"
                              ? "badge-warning"
                              : "badge-ghost"
                          }`}
                        >
                          {transaction.payoutStatus === "completed"
                            ? "Paid"
                            : transaction.status === "succeeded"
                            ? "Pending"
                            : transaction.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/orders/${transaction.order._id}`}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsDashboard;
