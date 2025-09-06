const Review = require("../models/Review");
const Service = require("../models/Service");

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
