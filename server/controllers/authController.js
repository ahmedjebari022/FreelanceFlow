const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { sendResetEmail } = require("../utils/email");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, passwordHash, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err || !user)
      return res.status(401).json({ message: info?.message || "Login failed" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({
        message: "Logged in",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
};

const getMe = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email },
      { new: true }
    );
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );
    await sendResetEmail(email, resetToken);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log("Received token:", token); // Log the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("Decoded:", decoded); // Log decoded payload
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "Invalid token" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("JWT Error:", error.message); // Log specific error
    res.status(400).json({ message: "Invalid or expired token" });
  }
};



module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordWithToken,
 
};
