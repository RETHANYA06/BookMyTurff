const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Manager = require('../models/Manager');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Unified Login Route POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, phone_number, password } = req.body;

        let user;
        let isManager = false;

        // Identification Logic
        if (email) {
            // Check Player/Admin collection first
            user = await Player.findOne({ email });
        } else if (phone_number) {
            // Check Manager (Owner) collection first
            user = await Manager.findOne({ phone_number }).populate('turf_id');
            if (user) {
                isManager = true;
            } else {
                // Check Player collection
                user = await Player.findOne({ phone_number });
            }
        } else {
            return res.status(400).json({ message: "Email or Phone Number is required" });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Password verification
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Role and Token Generation
        const role = user.role || (isManager ? 'owner' : 'user');
        const token = jwt.sign({ id: user._id, role }, 'your_jwt_secret', { expiresIn: '1d' });

        res.json({
            message: "Login successful",
            role: role,
            token,
            user: {
                id: user._id,
                full_name: user.full_name || user.name,
                phone_number: user.phone_number,
                email: user.email,
                role,
                turf_id: user.turf_id?._id,
                turf_name: user.turf_id?.turf_name
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unified Register Route POST /api/register
router.post('/register', async (req, res) => {
    try {
        if (req.body.role === 'owner') {
            return res.status(403).json({ message: 'Owners cannot self-register. Contact admin.' });
        }

        const {
            full_name, phone_number, password,
            age_group, gender, city, preferred_language,
            sports_played, skill_level, preferred_play_time, typical_group_size,
            willing_to_join_others, bring_own_equipment, notifications_opt_in
        } = req.body;

        if (!/^[6-9]\d{9}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const existingPhone = await Player.findOne({ phone_number });
        const existingManager = await Manager.findOne({ phone_number });

        if (existingPhone || existingManager) return res.status(400).json({ message: 'Phone number already registered' });

        if (!sports_played || sports_played.length === 0) {
            return res.status(400).json({ message: 'At least one sport must be selected' });
        }

        const player = new Player({
            full_name, phone_number, password,
            age_group, gender, city, preferred_language,
            sports_played, skill_level, preferred_play_time, typical_group_size,
            willing_to_join_others, bring_own_equipment, notifications_opt_in,
            role: 'user'
        });
        await player.save();

        const token = jwt.sign({ id: player._id, role: 'user' }, 'your_jwt_secret', { expiresIn: '1d' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            role: 'user',
            user: {
                id: player._id,
                full_name: player.full_name,
                phone_number: player.phone_number,
                role: 'user'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
