const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Turf = require('../models/Turf');
const bcrypt = require('bcryptjs');
const TurfItem = require('../models/TurfItem');
const Player = require('../models/Player'); // Added for global phone check
const jwt = require('jsonwebtoken'); // Added for tokens
const { generateSlotsForDate } = require('../utils/slotHelper');

// Register Manager + Turf Onboarding
router.post('/register', async (req, res) => {
    return res.status(403).json({ message: 'Owners cannot self-register. Contact admin.' });
});

// Login Manager
router.post('/login', async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        if (!/^[6-9]\d{9}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const manager = await Manager.findOne({ phone_number }).populate('turf_id');
        if (!manager) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: manager._id, role: manager.role || 'owner' }, 'your_jwt_secret', { expiresIn: '1d' });

        res.json({
            token,
            manager_id: manager._id,
            turf_id: manager.turf_id?._id,
            name: manager.name,
            role: manager.role || 'owner',
            turf_name: manager.turf_id?.turf_name
        });
    } catch (error) {
        console.error("Manager Login Error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
