const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { isAuthenticated } = require("../middleware/authMiddleware");


router.post(
  "/services/:serviceId/reviews",
  isAuthenticated,
  reviewController.createReview
);
router.get("/services/:serviceId/reviews", reviewController.getServiceReviews);

module.exports = router;
