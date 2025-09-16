const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordWithToken,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, getMe);
// Update this route to handle file uploads
router.put("/profile", isAuthenticated, upload.single('profileImage'), updateProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

module.exports = router;
