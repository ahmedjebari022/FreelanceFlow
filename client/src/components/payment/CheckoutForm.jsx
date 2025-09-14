// client/src/components/payments/CheckoutForm.jsx
import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";

const CheckoutForm = ({ orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(
          "/api/payments/create-payment-intent",
          { orderId },
          { withCredentials: true }
        );
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      }
    };

    createPaymentIntent();
  }, [orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded client-side:", paymentIntent);
        setError(null);
        setSucceeded(true);
        setProcessing(false);

        // Call onSuccess after a slight delay to ensure webhook has time to process
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        // Handle other statuses
        setError(`Payment status: ${paymentIntent.status}. Please try again.`);
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Card Details</span>
        </label>
        <div className="border rounded-lg p-4 bg-base-200">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
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

      {succeeded ? (
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
          <span>Payment successful!</span>
        </div>
      ) : (
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={processing || !stripe}
        >
          {processing ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            `Pay Now`
          )}
        </button>
      )}
    </form>
  );
};

export default CheckoutForm;
