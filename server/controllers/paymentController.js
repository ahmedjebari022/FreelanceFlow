// server/controllers/paymentController.js
const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { getIO } = require("../config/socket");

const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

const paymentController = {
  // Create a payment intent
  createPaymentIntent: async (req, res) => {
    try {
      const { orderId } = req.body;
      console.log("Creating payment intent for order:", orderId);

      // Find the order
      const order = await Order.findById(orderId)
        .populate("service")
        .populate("client")
        .populate("freelancer");

      if (!order) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      // Log important details
      console.log(
        `Payment details: ${order.price} for service '${order.service.title}'`
      );
      console.log(
        `Client: ${order.client._id}, Freelancer: ${order.freelancer._id}`
      );

      // Check if order already has a payment
      const existingPayment = await Payment.findOne({
        order: orderId,
        status: { $in: ["pending", "succeeded"] },
      });

      if (existingPayment) {
        // If payment exists and is pending, return the existing client secret
        if (existingPayment.status === "pending") {
          const intent = await stripe.paymentIntents.retrieve(
            existingPayment.stripePaymentIntentId
          );
          return res.json({
            clientSecret: intent.client_secret,
            paymentId: existingPayment._id,
          });
        }

        // If payment succeeded, return appropriate message
        if (existingPayment.status === "succeeded") {
          return res.status(400).json({
            message: "Payment already completed for this order",
            completed: true,
          });
        }
      }

      // Continue with creating new payment intent if no valid payment exists
      // Calculate amounts
      const amount = Math.round(order.price * 100); // Stripe works in cents
      const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
      const freelancerAmount = amount - platformFee;

      console.log(
        `Creating payment intent with amount: ${amount} cents (${order.price} EUR)`
      );
      console.log(
        `Platform fee: ${platformFee} cents (${platformFee / 100} EUR)`
      );
      console.log(
        `Freelancer amount: ${freelancerAmount} cents (${
          freelancerAmount / 100
        } EUR)`
      );

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "eur",
        metadata: {
          orderId: order._id.toString(),
          serviceId: order.service._id.toString(),
          clientId: order.client._id.toString(),
          freelancerId: order.freelancer._id.toString(),
        },
      });

      // Store the proper amount values in the database - IMPORTANT
      const payment = new Payment({
        order: order._id,
        amount: order.price,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        payoutStatus: "pending",
        platformFee: platformFee / 100, // Convert back to regular currency for DB
        freelancerAmount: freelancerAmount / 100, // Convert back to regular currency for DB
      });

      await payment.save();
      console.log("Payment record created:", payment._id);

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
      });
    } catch (error) {
      console.error("Payment intent error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Handle webhook events from Stripe
  handleWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook received:", event.type);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          console.log("Payment succeeded:", paymentIntent.id);
          await handleSuccessfulPayment(paymentIntent);
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          console.log("Payment failed:", paymentIntent.id);
          await handleFailedPayment(paymentIntent);
          break;
        }
        case "charge.succeeded": {
          try {
            const charge = event.data.object;
            // Store the charge ID with the payment
            const paymentIntent = charge.payment_intent;
            if (paymentIntent) {
              await Payment.findOneAndUpdate(
                { stripePaymentIntentId: paymentIntent },
                {
                  stripeChargeId: charge.id,
                  currency: charge.currency,
                }
              );
              console.log(
                `Charge ID ${charge.id} with currency ${charge.currency} stored for payment intent ${paymentIntent}`
              );
            }
          } catch (error) {
            console.error("Error handling charge.succeeded:", error);
          }
          break;
        }
        // Handle other events if needed
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error processing webhook:", err);
      // Still return 200 to acknowledge receipt
      res.json({ received: true, error: err.message });
    }
  },

  // Get payment for an order
  getOrderPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify user is client or freelancer for this order
      if (
        order.client.toString() !== req.user._id.toString() &&
        order.freelancer.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this payment" });
      }

      const payment = await Payment.findOne({ order: orderId });
      if (!payment) {
        return res
          .status(404)
          .json({ message: "No payment found for this order" });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Release payment to freelancer (admin only)
  releasePayment: async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await Payment.findById(paymentId).populate({
        path: "order",
        populate: { path: "freelancer" },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (
        payment.status !== "succeeded" ||
        payment.payoutStatus === "completed"
      ) {
        return res.status(400).json({ message: "Payment cannot be released" });
      }

      // Get the freelancer's Connect account ID
      const freelancer = await User.findById(payment.order.freelancer._id);
      if (!freelancer || !freelancer.stripeConnectId) {
        return res.status(400).json({
          message: "Freelancer has not set up their payment account yet",
        });
      }

      // Check if we have the charge ID stored already
      let chargeId = payment.stripeChargeId;
      let currency = payment.currency || "eur"; // Default to EUR since that's what your account uses

      // If no charge ID, get it from the payment intent
      if (!chargeId) {
        try {
          console.log("No stored charge ID, retrieving from Stripe...");
          const paymentIntent = await stripe.paymentIntents.retrieve(
            payment.stripePaymentIntentId,
            { expand: ["latest_charge"] }
          );

          // Get charge ID and currency
          if (typeof paymentIntent.latest_charge === "string") {
            chargeId = paymentIntent.latest_charge;

            // Get the charge to find the currency
            const charge = await stripe.charges.retrieve(chargeId);
            currency = charge.currency;
          } else if (paymentIntent.latest_charge) {
            chargeId = paymentIntent.latest_charge.id;
            currency = paymentIntent.latest_charge.currency || "eur";
          } else {
            throw new Error("Could not retrieve charge ID from payment intent");
          }

          if (chargeId) {
            // Store it for future use
            payment.stripeChargeId = chargeId;
            payment.currency = currency;
            await payment.save();
            console.log(
              `Retrieved and stored charge ID: ${chargeId} with currency: ${currency}`
            );
          } else {
            throw new Error("Could not retrieve charge ID from payment intent");
          }
        } catch (err) {
          console.error("Failed to retrieve charge ID:", err);
          return res
            .status(500)
            .json({ message: "Could not retrieve charge information" });
        }
      }

      console.log(`Creating transfer using charge ID: ${chargeId}`);
      console.log(`Destination Connect account: ${freelancer.stripeConnectId}`);
      console.log(
        `Amount: ${Math.round(payment.freelancerAmount * 100)} cents (${
          payment.freelancerAmount
        } ${currency})`
      );
      console.log(`Using currency: ${currency}`);

      // Get the actual charge amount directly from Stripe
      const charge = await stripe.charges.retrieve(chargeId);
      const chargeAmount = charge.amount;
      const platformFeeAmount = Math.round(
        chargeAmount * (PLATFORM_FEE_PERCENT / 100)
      );
      const transferAmount = chargeAmount - platformFeeAmount;

      console.log(`Original charge amount: ${chargeAmount / 100} ${currency}`);
      console.log(
        `Platform fee (${PLATFORM_FEE_PERCENT}%): ${
          platformFeeAmount / 100
        } ${currency}`
      );
      console.log(`Transfer amount: ${transferAmount / 100} ${currency}`);

      // Create transfer with the correct amount
      const transfer = await stripe.transfers.create({
        amount: transferAmount, // Already in cents
        currency: currency,
        destination: freelancer.stripeConnectId,
        source_transaction: chargeId,
        description: `Payment for order #${payment.order._id}`,
        metadata: {
          orderId: payment.order._id.toString(),
          paymentId: payment._id.toString(),
        },
      });

      console.log("Transfer created successfully:", transfer.id);

      // Update payment record
      payment.payoutStatus = "completed";
      payment.status = "transferred";
      payment.payoutId = transfer.id;
      await payment.save();

      // Notify the freelancer
      getIO()
        .to(`user-${payment.order.freelancer._id.toString()}`)
        .emit("notification", {
          type: "payment-released",
          message: "Payment has been released to your account",
          orderId: payment.order._id,
        });

      res.json({ payment, transfer });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Create Connect account for freelancers
  createConnectAccount: async (req, res) => {
    try {
      // Check if user is a freelancer
      if (req.user.role !== "freelancer") {
        return res
          .status(403)
          .json({ message: "Only freelancers can create payment accounts" });
      }

      // Check if account already exists
      if (req.user.stripeConnectId) {
        return res
          .status(400)
          .json({ message: "Payment account already exists" });
      }

      // Create a Connect account
      const account = await stripe.accounts.create({
        type: "express", // or 'standard' depending on your needs
        email: req.user.email,
        business_type: "individual", // or 'company'
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: req.user._id.toString(),
        },
      });

      // Update user with the connect account ID
      await User.findByIdAndUpdate(
        req.user._id,
        { stripeConnectId: account.id },
        { new: true }
      );

      // Create an account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.CLIENT_URL}/freelancer/onboarding/refresh`,
        return_url: `${process.env.CLIENT_URL}/freelancer/onboarding/complete`,
        type: "account_onboarding",
      });

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error("Connect account error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Check status of Connect account
  getConnectAccountStatus: async (req, res) => {
    try {
      // Check if user has a Connect account
      if (!req.user.stripeConnectId) {
        return res.json({ status: "not_created" });
      }

      // Get account details from Stripe
      const account = await stripe.accounts.retrieve(req.user.stripeConnectId);

      // Determine status based on account details
      let status = "pending";
      if (account.charges_enabled && account.payouts_enabled) {
        status = "active";

        // Update user model if needed
        if (!req.user.payoutEnabled) {
          await User.findByIdAndUpdate(
            req.user._id,
            { payoutEnabled: true },
            { new: true }
          );
        }
      }

      res.json({
        status,
        accountId: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });
    } catch (error) {
      console.error("Error checking account status:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Handle Connect account webhook events
  handleConnectWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET ||
          process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Connect webhook received:", event.type);
    } catch (err) {
      console.error(
        "⚠️ Connect webhook signature verification failed:",
        err.message
      );
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "account.updated": {
          const account = event.data.object;
          await handleAccountUpdate(account);
          break;
        }
        // Handle other events if needed
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error processing connect webhook:", err);
      // Still return 200 to acknowledge receipt
      res.json({ received: true, error: err.message });
    }
  },
};

// Helper functions
async function handleSuccessfulPayment(paymentIntent) {
  try {
    console.log("Processing successful payment:", paymentIntent.id);
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      console.error("No orderId found in payment metadata");
      return;
    }

    // Update payment status in database first
    const paymentUpdate = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "succeeded" },
      { new: true }
    );

    if (!paymentUpdate) {
      console.error("Payment record not found for:", paymentIntent.id);
      return;
    }

    console.log("Updated payment status to succeeded:", paymentUpdate._id);

    // Try to get charge ID and currency
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
        expand: ["latest_charge"],
      });

      // Get charge ID from latest_charge
      if (intent.latest_charge) {
        // Handle both string ID and expanded object
        const chargeId =
          typeof intent.latest_charge === "string"
            ? intent.latest_charge
            : intent.latest_charge.id;

        console.log("Found charge ID:", chargeId);

        // Get charge details to confirm currency
        const charge = await stripe.charges.retrieve(chargeId);
        const currency = charge.currency;

        console.log(`Storing charge ID: ${chargeId}, currency: ${currency}`);

        await Payment.findByIdAndUpdate(paymentUpdate._id, {
          stripeChargeId: chargeId,
          currency: currency,
        });
      }
    } catch (err) {
      // Just log this error, don't stop the main flow
      console.error("Error fetching charge ID:", err);
    }

    // Update order payment status
    const orderUpdate = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "paid" },
      { new: true }
    );

    if (!orderUpdate) {
      console.error("Order not found:", orderId);
      return;
    }

    console.log("Updated order payment status to paid:", orderUpdate._id);

    // Notify freelancer
    getIO()
      .to(`user-${orderUpdate.freelancer.toString()}`)
      .emit("notification", {
        type: "payment-received",
        message: "Payment received for your order",
        orderId,
      });
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(paymentIntent) {
  try {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "failed" }
    );
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

async function handleAccountUpdate(account) {
  try {
    // Find the user with this connect account
    const user = await User.findOne({ stripeConnectId: account.id });

    if (!user) {
      console.error("No user found for Connect account:", account.id);
      return;
    }

    // Update the user's payout status if charges and payouts are enabled
    if (
      account.charges_enabled &&
      account.payouts_enabled &&
      !user.payoutEnabled
    ) {
      await User.findByIdAndUpdate(
        user._id,
        { payoutEnabled: true },
        { new: true }
      );

      console.log(`User ${user._id} payment account is now fully enabled`);

      // Notify the user
      getIO().to(`user-${user._id.toString()}`).emit("notification", {
        type: "account-ready",
        message: "Your payment account setup is complete!",
      });
    }
  } catch (error) {
    console.error("Error handling account update:", error);
  }
}

module.exports = paymentController;
