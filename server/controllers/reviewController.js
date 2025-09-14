const Review = require("../models/Review");
const Service = require("../models/Service");
const Order = require("../models/Order");

const reviewController = {
  // Create review (clients only)
  createReview: async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const serviceId = req.params.serviceId;

      // Check if client has already reviewed this service
      const existingReview = await Review.findOne({
        service: serviceId,
        client: req.user._id,
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this service" });
      }

      // Check if client has a completed order for this service
      const completedOrder = await Order.findOne({
        service: serviceId,
        client: req.user._id,
        status: "completed",
        isReviewable: true,
      });

      if (!completedOrder) {
        return res
          .status(403)
          .json({
            message:
              "You can only review services you have ordered and completed",
          });
      }

      const review = new Review({
        service: serviceId,
        client: req.user._id,
        rating,
        comment,
      });

      await review.save();

      // Update service rating
      const reviews = await Review.find({ service: serviceId });
      const avgRating =
        reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

      await Service.findByIdAndUpdate(serviceId, {
        averageRating: avgRating,
        totalReviews: reviews.length,
      });

      // Mark the order as reviewed
      completedOrder.isReviewable = false;
      await completedOrder.save();

      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get reviews for a service
  getServiceReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ service: req.params.serviceId })
        .populate("client", "firstName lastName")
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = reviewController;
