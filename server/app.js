const express = require("express");
const session = require("express-session");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const connectDB = require("./db");
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow client origin
    credentials: true, // Allow cookies/sessions
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Middleware (order matters!)
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret", // Use a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session()); // Enable Passport sessions

// HTTPS Enforcement (Production only)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Routes (after all middleware)
app.use("/api/auth", authRoutes);
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api", require("./routes/reviewRoutes"));

// Basic route to test server and DB connection
app.get("/", (req, res) => {
  res.send("Server is running and connected to MongoDB!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
