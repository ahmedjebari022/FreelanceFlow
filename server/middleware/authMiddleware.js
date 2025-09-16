const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Refresh session expiry on each authenticated request
    if (req.session.cookie) {
      req.session.touch(); // Refresh the session
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

const hasRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });
  next();
};

module.exports = { isAuthenticated, hasRole };
