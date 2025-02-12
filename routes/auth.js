const express = require('express');
const User = require('../bin/models/user_details_model');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('../app');
const { v4: uuidv4 } = require('uuid'); 
require("dotenv").config;
router.post('/createuser', async (req, res) => {
    try {
        const { userName, emailId, password, role } = req.body;

        if (!userName || !emailId || !password) {
            const missingFields = [];
            if (!userName) missingFields.push("userName");
            if (!emailId) missingFields.push("emailId");
            if (!password) missingFields.push("password");
        
            return res.status(400).json({ 
                message: `The following fields are required: ${missingFields.join(", ")}`
            });
        }

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            const token = jwt.sign(
                { userName: existingUser.userName, emailId: existingUser.emailId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(400).json({ 
                message: "Email already registered", 
                token 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const newUser = new User({
            userId,
            userName,
            emailId,
            password: hashedPassword,
            role: role || 'user',
        });

        await newUser.save();

        res.status(201).json({ message: "User successfully registered" });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Duplicate key error: A user with this emailId or userId already exists."
            });
        }

        res.status(500).json({
            message: "An error occurred while creating the user",
            error: error.message,
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ emailId: emailId.toLowerCase() });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.role) {
            console.error(`Role missing for user: ${user.emailId}`);
            return res.status(500).json({ message: "User role is missing. Please contact support." });
        }

        const token = jwt.sign(
            { userId: user.userId, userName: user.userName, emailId: user.emailId, role: user.role },
            process.env.JWT_SECRET,
            { algorithm: "HS256", expiresIn: "1h" }
        );        

        res.status(200).json({
            message: "Login successful",
            token,
            user: { userId: user.userId, userName: user.userName, emailId: user.emailId, role: user.role }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

router.get('/users', async(req,res)=>{
    try {
        let result = await User.find();
        res.json(result);
    } catch (err) {
        console.error('Error fetching Users list:', err);
        res.status(500).json({ error: 'Failed to fetch users list' });
    }
})


module.exports = router;
