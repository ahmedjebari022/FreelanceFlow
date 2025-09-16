import { useState, useEffect } from "react";
import axios from "axios";

const PaymentStats = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/revenue-stats?period=${period}`, {
          withCredentials: true,
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching revenue stats:", err);
        setError("Failed to load revenue statistics");
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, [period]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  // Helper function to format date labels based on period
  const formatDateLabel = (item) => {
    switch (period) {
      case "daily":
        return `${item._id.month}/${item._id.day}/${item._id.year}`;
      case "weekly":
        return `Week ${item._id.week}, ${item._id.year}`;
      case "monthly":
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return `${monthNames[item._id.month - 1]} ${item._id.year}`;
      case "yearly":
        return item._id.year.toString();
      default:
        return "";
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Revenue Statistics</h1>
      
      {/* Period Selection */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-medium">View revenue by period:</div>
        
        <div className="btn-group">
          <button 
            className={`btn ${period === "daily" ? "btn-active" : ""}`}
            onClick={() => setPeriod("daily")}
          >
            Daily
          </button>
          <button 
            className={`btn ${period === "weekly" ? "btn-active" : ""}`}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </button>
          <button 
            className={`btn ${period === "monthly" ? "btn-active" : ""}`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button 
            className={`btn ${period === "yearly" ? "btn-active" : ""}`}
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>
      
      {/* Revenue Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Stats Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Revenue Summary</h2>
            
            {stats && stats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Total Revenue</th>
                      <th>Platform Fees</th>
                      <th>Freelancer Earnings</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((item, index) => (
                      <tr key={index}>
                        <td>{formatDateLabel(item)}</td>
                        <td>{formatCurrency(item.totalAmount)}</td>
                        <td>{formatCurrency(item.platformFees)}</td>
                        <td>{formatCurrency(item.freelancerAmount)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>No revenue data available for this period</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Total Figures */}
        {stats && stats.length > 0 && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">
                {formatCurrency(stats.reduce((sum, item) => sum + item.totalAmount, 0))}
              </div>
              <div className="stat-desc">For selected period</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Platform Fees</div>
              <div className="stat-value">
                {formatCurrency(stats.reduce((sum, item) => sum + item.platformFees, 0))}
              </div>
              <div className="stat-desc">Revenue for the platform</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Freelancer Earnings</div>
              <div className="stat-value">
                {formatCurrency(stats.reduce((sum, item) => sum + item.freelancerAmount, 0))}
              </div>
              <div className="stat-desc">Paid to freelancers</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Transactions</div>
              <div className="stat-value">
                {stats.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="stat-desc">Total transactions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStats;