const Order = require("../models/Order");
const Service = require("../models/Service");
const Payment = require("../models/Payment"); // Add this
const { getIO } = require("../config/socket");
// Remove the line that imports ../services/paymentService

// Import the payment controller to reuse the releasePayment logic
const paymentController = require("./paymentController");
const stripe = require("../config/stripe");

const orderController = {
  // Create new order (client only)
  createOrder: async (req, res) => {
    try {
      const { serviceId, requirements } = req.body;

      // Find the service to get pricing and freelancer info
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Verify client is not the freelancer
      if (service.freelancer.toString() === req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "You cannot order your own service" });
      }

      const order = new Order({
        service: serviceId,
        client: req.user._id,
        freelancer: service.freelancer,
        requirements,
        price: service.price,
        status: "pending",
        paymentStatus: "unpaid",
      });

      await order.save();

      // Notify freelancer about new order
      getIO().to(`user-${service.freelancer.toString()}`).emit("notification", {
        type: "new-order",
        message: "You have received a new order",
        orderId: order._id,
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all orders for the current user
  getMyOrders: async (req, res) => {
    try {
      let orders;
      const { role } = req.user;
      const { status } = req.query;

      // Build query based on status filter
      let query = {};
      if (status && status !== "all") {
        query.status = status;
      }

      // Find orders based on user role
      if (role === "client") {
        query.client = req.user._id;
        orders = await Order.find(query)
          .populate("service", "title price images")
          .populate("freelancer", "firstName lastName")
          .sort({ createdAt: -1 });
      } else {
        query.freelancer = req.user._id;
        orders = await Order.find(query)
          .populate("service", "title price images")
          .populate("client", "firstName lastName")
          .sort({ createdAt: -1 });
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get single order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("service", "title description images")
        .populate("client", "firstName lastName email")
        .populate("freelancer", "firstName lastName email");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the user is either the client or freelancer
      if (
        order.client._id.toString() !== req.user._id.toString() &&
        order.freelancer._id.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this order" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check permissions based on the requested status change
      if (
        (status === "accepted" ||
          status === "in_progress" ||
          status === "completed") &&
        order.freelancer.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Only the freelancer can update to this status" });
      }

      if (
        status === "cancelled" &&
        order.client.toString() !== req.user._id.toString() &&
        order.freelancer.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this order" });
      }

      // Update status and relevant dates
      order.status = status;

      if (status === "accepted") {
        order.startDate = new Date();
      } else if (status === "completed") {
        order.completionDate = new Date();
        order.isReviewable = true;

        // Schedule automatic payment release after a delay
        // For testing purposes, use a short delay (1 minute)
        const RELEASE_DELAY = 10 * 1000; // 1 minute (change to longer in production)

        console.log(
          `Scheduling payment release for order ${order._id} in ${
            RELEASE_DELAY / 1000
          } seconds`
        );

        setTimeout(async () => {
          try {
            const payment = await Payment.findOne({
              order: order._id,
              status: "succeeded",
              payoutStatus: "pending",
            });

            if (payment) {
              console.log(`Auto-releasing payment for order ${order._id}`);

              // Check if we have a charge ID
              if (!payment.stripeChargeId) {
                // Try to get the charge ID
                try {
                  // Use latest_charge instead of charges.data
                  const paymentIntent = await stripe.paymentIntents.retrieve(
                    payment.stripePaymentIntentId
                  );

                  // Get charge ID directly from latest_charge property
                  // For older API versions, this might be the ID of the first charge
                  const chargeId =
                    paymentIntent.latest_charge ||
                    (paymentIntent.charges &&
                    paymentIntent.charges.data &&
                    paymentIntent.charges.data[0]
                      ? paymentIntent.charges.data[0].id
                      : null);

                  if (chargeId) {
                    payment.stripeChargeId = chargeId;
                    await payment.save();
                    console.log(
                      "Retrieved charge ID for auto-release:",
                      chargeId
                    );
                  } else {
                    // If no charge ID found, use a more robust method
                    console.log(
                      "No charge ID found in payment intent, trying expanded retrieve..."
                    );

                    // Try getting the charges with explicit expansion
                    const expandedIntent = await stripe.paymentIntents.retrieve(
                      payment.stripePaymentIntentId,
                      { expand: ["latest_charge"] }
                    );

                    if (
                      expandedIntent.latest_charge &&
                      expandedIntent.latest_charge.id
                    ) {
                      payment.stripeChargeId = expandedIntent.latest_charge.id;
                      await payment.save();
                      console.log(
                        "Retrieved charge ID from expanded intent:",
                        expandedIntent.latest_charge.id
                      );
                    } else {
                      console.error("Could not find charge ID by any method");
                      return;
                    }
                  }
                } catch (err) {
                  console.error(
                    "Failed to retrieve charge for auto-release:",
                    err
                  );
                  return;
                }
              }

              // Create a mock request and response object
              const mockReq = {
                params: { paymentId: payment._id },
              };

              const mockRes = {
                json: (data) =>
                  console.log("Payment auto-released successfully:", data),
                status: (code) => ({
                  json: (data) =>
                    console.log(`Error (${code}) releasing payment:`, data),
                }),
              };

              // Call the releasePayment function with the mock req/res
              await paymentController.releasePayment(mockReq, mockRes);
            } else {
              console.log(
                `No eligible payment found for auto-release for order ${order._id}`
              );
            }
          } catch (err) {
            console.error("Auto payment release failed:", err);
          }
        }, RELEASE_DELAY);
      }

      await order.save();

      // Send status update notification
      // Existing code...

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add message to order
  addMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the user is either the client or freelancer
      if (
        order.client.toString() !== req.user._id.toString() &&
        order.freelancer.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to message in this order" });
      }

      const newMessage = {
        sender: req.user._id,
        content,
        timestamp: new Date(),
      };

      order.messages.push(newMessage);
      await order.save();

      // Emit new message to order room
      getIO()
        .to(`order-${order._id}`)
        .emit("new-message", {
          ...newMessage,
          sender: {
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
          },
        });

      // Determine recipient for notification
      const recipientId =
        req.user._id.toString() === order.client.toString()
          ? order.freelancer.toString()
          : order.client.toString();

      // Send notification to recipient
      getIO()
        .to(`user-${recipientId}`)
        .emit("notification", {
          type: "new-message",
          message: "You have a new message",
          orderId: order._id,
          content:
            content.substring(0, 30) + (content.length > 30 ? "..." : ""),
        });

      res.json(newMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get messages for an order
  getOrderMessages: async (req, res) => {
    try {
      // First check if user has access to this order
      const orderCheck = await Order.findById(req.params.id).select(
        "client freelancer"
      );

      if (!orderCheck) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the user is either the client or freelancer
      if (
        orderCheck.client.toString() !== req.user._id.toString() &&
        orderCheck.freelancer.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view messages for this order" });
      }

      // Then get the messages
      const order = await Order.findById(req.params.id)
        .select("messages")
        .populate("messages.sender", "firstName lastName");

      res.json(order.messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = orderController;
