const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user_details_model');
const bcrypt = require('bcryptjs');
const router = express.Router();

function generateToken(user) {
    const payload = {
        id: user.userId,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

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
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded);

        // Fix: Use findOne({ userId: decoded.userId }) for UUIDs
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Retrieved User:", user);

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access Denied: Admins Only" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token Expired" });
        }
        return res.status(400).json({ message: "Invalid Token" });
    }
};

  router.get('/admin/dashboard', authenticateAdmin, (req, res) => {
    res.json({
      message: 'Welcome to the Admin Dashboard!',
      user: req.user
    });
  });
module.exports = { generateToken, authorize,authenticateAdmin};
