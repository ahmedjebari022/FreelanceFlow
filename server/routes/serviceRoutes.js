const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.post(
  "/",
  isAuthenticated,
  upload.array("images", 5), // Allow up to 5 images
  serviceController.createService
);
router.put(
  "/:id",
  isAuthenticated,
  upload.array("images", 5),
  serviceController.updateService
);
router.delete("/:id", isAuthenticated, serviceController.deleteService);

module.exports = router;
