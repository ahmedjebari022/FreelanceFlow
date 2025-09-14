// client/src/components/payments/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";

// Load Stripe outside of component render to avoid recreating Stripe object on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`, {
          withCredentials: true,
        });
        setOrder(response.data);
      } catch (err) {
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePaymentSuccess = () => {
    let attempts = 0;
    const maxAttempts = 10;

    // Force refresh the order data
    const checkPaymentStatus = async () => {
      try {
        console.log("Checking payment status, attempt:", attempts + 1);
        const response = await axios.get(`/api/orders/${orderId}`, {
          withCredentials: true,
        });

        console.log("Current order status:", response.data.paymentStatus);

        if (response.data.paymentStatus === "paid") {
          // If payment is confirmed, navigate back
          console.log("Payment confirmed as paid, navigating back");
          navigate(`/orders/${orderId}`);
          return;
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            console.log("Max attempts reached, navigating back anyway");
            navigate(`/orders/${orderId}`);
            return;
          }
          // Check again in 2 seconds
          console.log("Payment not confirmed yet, checking again in 2 seconds");
          setTimeout(checkPaymentStatus, 2000);
        }
      } catch (err) {
        console.error("Failed to check payment status:", err);
        // Still navigate back after error
        navigate(`/orders/${orderId}`);
      }
    };

    // Start checking after a brief delay to allow webhook processing
    setTimeout(checkPaymentStatus, 1000);
  };

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

  if (!order) return null;

  // Check if payment is already completed
  if (order.paymentStatus === "paid") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
          <div className="card-body">
            <div className="alert alert-success">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>This order has already been paid for!</span>
            </div>
            <div className="text-center mt-4">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/orders/${orderId}`)}
              >
                View Order Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Complete Your Payment</h2>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{order.service.title}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-medium">
                {order.freelancer.firstName} {order.freelancer.lastName}
              </span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${order.price}</span>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
