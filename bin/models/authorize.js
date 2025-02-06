const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user_details_model');
const bcrypt = require('bcryptjs');
const router = express.Router();

function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function authorize(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendErrorResponse(res, 401, 'Authorization header must be in the format: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.decode(token);
        console.log('Decoded Token Payload:', decoded);

 
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error(`[${req.method} ${req.path}] JWT Verification Error:`, err);

                if (err.name === 'TokenExpiredError') {
                    return sendErrorResponse(res, 401, 'Token expired. Please log in again.');
                }

                return sendErrorResponse(res, 403, 'Invalid token');
            }

            req.user = user;
            console.log(`[${req.method} ${req.path}] User verified:`, req.user);
            next();
        });
    } catch (err) {
        console.error('Token decoding error:', err);
        return sendErrorResponse(res, 401, 'Invalid token format.');
    }
}
const authenticateAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid Token' });
    }
  };
  
  // Admin route (accessible only by admins)
  router.get('/admin/dashboard', authenticateAdmin, (req, res) => {
    res.json({
      message: 'Welcome to the Admin Dashboard!',
      user: req.user
    });
  });
module.exports = { generateToken, authorize,authenticateAdmin};
