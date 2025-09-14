// client/src/components/freelancer/PaymentSetup.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const PaymentSetup = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    // Check if user already has a Connect account
    const checkAccountStatus = async () => {
      try {
        const response = await axios.get("/api/payments/account-status", {
          withCredentials: true,
        });
        setAccountStatus(response.data.status);
      } catch (err) {
        setError("Failed to check account status");
      }
    };

    if (user && user.role === "freelancer") {
      checkAccountStatus();
    }
  }, [user]);

  const handleSetupAccount = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/payments/create-connect-account",
        {},
        {
          withCredentials: true,
        }
      );

      // Redirect to Stripe's hosted onboarding
      window.location.href = response.data.url;
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to setup payment account"
      );
      setLoading(false);
    }
  };

  if (!user || user.role !== "freelancer") {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-warning">
          Only freelancers can access payment setup
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Payment Account Setup</h2>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          {accountStatus === "active" ? (
            <div className="alert alert-success">
              Your payment account is active and ready to receive payments
            </div>
          ) : accountStatus === "pending" ? (
            <div className="alert alert-warning">
              Your payment account is pending completion. Please finish the
              onboarding process.
            </div>
          ) : (
            <>
              <p className="mb-6">
                To receive payments from clients, you need to set up your
                payment account. This is a secure process handled by Stripe, our
                payment provider.
              </p>

              <button
                className="btn btn-primary"
                onClick={handleSetupAccount}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Set Up Payment Account"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSetup;
