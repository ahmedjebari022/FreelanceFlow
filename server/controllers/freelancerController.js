// Add to server/controllers/freelancerController.js
const Payment = require("../models/Payment");
const Order = require("../models/Order");

const freelancerController = {
  // Get earnings summary
  getEarnings: async (req, res) => {
    try {
      // Ensure user is a freelancer
      if (req.user.role !== "freelancer") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all payments for orders where this user is the freelancer
      const payments = await Payment.find().populate({
        path: "order",
        match: { freelancer: req.user._id },
      });

      // Filter out payments where order is null (not for this freelancer)
      const freelancerPayments = payments.filter(
        (payment) => payment.order !== null
      );

      // Calculate earnings
      const total = freelancerPayments.reduce((sum, payment) => {
        return payment.status === "succeeded" ||
          payment.status === "transferred"
          ? sum + payment.freelancerAmount
          : sum;
      }, 0);

      const pending = freelancerPayments.reduce((sum, payment) => {
        return payment.status === "succeeded" &&
          payment.payoutStatus === "pending"
          ? sum + payment.freelancerAmount
          : sum;
      }, 0);

      const available = freelancerPayments.reduce((sum, payment) => {
        return payment.payoutStatus === "completed"
          ? sum + payment.freelancerAmount
          : sum;
      }, 0);

      res.json({
        total,
        pending,
        available,
      });
    } catch (error) {
      console.error("Error getting earnings:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get transaction history
  getTransactions: async (req, res) => {
    try {
      // Ensure user is a freelancer
      if (req.user.role !== "freelancer") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all payments for this freelancer
      const payments = await Payment.find()
        .populate({
          path: "order",
          match: { freelancer: req.user._id },
          populate: { path: "service" },
        })
        .sort({ createdAt: -1 })
        .limit(50) // Limit to recent 50 transactions
        .exec();

      // Filter out payments where order is null (not for this freelancer)
      const transactions = payments.filter((payment) => payment.order !== null);

      res.json(transactions);
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = freelancerController;
