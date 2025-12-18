// middleware/auth.js
import jwt from 'jsonwebtoken';

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.isGuest = false;
    } catch (err) {
      req.user = null;
      req.isGuest = true; // Mark as guest for tracking
    }
  } else {
    req.user = null;
    req.isGuest = true; // Mark as guest for tracking
  }

  next();
};