const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Player = require('../models/Player');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to check admin role
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const decoded = jwt.verify(token, 'your_jwt_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Create Owner Account
router.post('/create-owner', authenticateAdmin, async (req, res) => {
    try {
        const { name, phone_number, email, password, registration_id } = req.body;

        if (!/^[6-9]\d{9}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        if (!registration_id) {
            return res.status(400).json({ message: 'Registration ID is required' });
        }

        let existingManager = await Manager.findOne({ $or: [{ phone_number }, { registration_id }] });
        let existingPlayer = await Player.findOne({ phone_number });

        if (existingManager || existingPlayer) {
            return res.status(400).json({ message: 'Phone number or Registration ID already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const manager = new Manager({ 
            name, 
            phone_number, 
            registration_id,
            email, 
            password: hashedPassword,
            role: 'owner'
        });
        
        await manager.save();

        res.status(201).json({ 
            message: 'Owner created successfully',
            manager_id: manager._id 
        });
    } catch (error) {
        console.error("Admin Create Owner Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get all Owner Accounts
router.get('/owners', authenticateAdmin, async (req, res) => {
    try {
        const owners = await Manager.find({ role: 'owner' })
            .select('-password')
            .populate('turf_id', 'turf_name location')
            .sort({ createdAt: -1 });
        res.json(owners);
    } catch (error) {
        console.error("Fetch Owners Error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
