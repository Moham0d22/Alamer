const jwt = require('jsonwebtoken');

// Protect routes - requires valid JWT
module.exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'غير مصرح: لا يوجد توكن' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'غير مصرح: توكن غير صالح أو منتهي' });
  }
};
