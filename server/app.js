const express = require("express");
const session = require("express-session");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const connectDB = require("./db");
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const http = require("http"); // Add this
const { initializeSocket } = require("./config/socket"); // Add this
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = initializeSocket(server); // Initialize Socket.IO
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow client origin
    credentials: true, // Allow cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Middleware (order matters!)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/FreelanceFlow",
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
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

// Stripe webhook route (must come BEFORE the express.json() middleware)
const paymentController = require("./controllers/paymentController");
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Regular middleware AFTER the webhook route
app.use(express.json());

// Routes (after all middleware)
app.use("/api/auth", authRoutes);
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/orders", require("./routes/orderRoutes")); // Add this line
app.use("/api", require("./routes/reviewRoutes"));

// Regular payment routes
app.use("/api/payments", require("./routes/paymentRoutes"));

// Add to app.js
app.use("/api/freelancer", require("./routes/freelancerRoutes"));

// In server/app.js - Add this line with your other route imports
app.use("/api/admin", require("./routes/adminRoutes"));

// Basic route to test server and DB connection
app.get("/", (req, res) => {
  res.send("Server is running and connected to MongoDB!");
});

// Add to app.js
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Session ID:", req.sessionID);
    console.log("Authenticated:", req.isAuthenticated());
    next();
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
