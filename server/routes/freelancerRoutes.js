// New file: server/routes/freelancerRoutes.js
const express = require("express");
const router = express.Router();
const freelancerController = require("../controllers/freelancerController");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");

// Get earnings summary
router.get(
  "/earnings",
  isAuthenticated,
  hasRole(["freelancer"]),
  freelancerController.getEarnings
);

// Get transaction history
router.get(
  "/transactions",
  isAuthenticated,
  hasRole(["freelancer"]),
  freelancerController.getTransactions
);

module.exports = router;