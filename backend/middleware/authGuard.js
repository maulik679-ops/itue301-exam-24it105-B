const jwt = require('jsonwebtoken');

/**
 * Task 3: Custom authGuard middleware
 * Validates the Bearer token and returns 401 if missing or invalid.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: No token provided or invalid format',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'supersecret_driveeasy_jwt_key_2026';

  try {
    const decoded = jwt.verify(token, secret);
    req.customer = decoded; // Contains customer id, email, name
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Token is invalid or has expired',
    });
  }
};

module.exports = authGuard;
