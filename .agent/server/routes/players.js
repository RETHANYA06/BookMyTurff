const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const {
            full_name, phone_number, password, email,
            age_group, gender, city, preferred_language,
            sports_played, skill_level, preferred_play_time, typical_group_size,
            willing_to_join_others, bring_own_equipment, notifications_opt_in
        } = req.body;

        const existingPhone = await Player.findOne({ phone_number });
        if (existingPhone) return res.status(400).json({ message: 'Phone number already registered' });

        const existingEmail = await Player.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

        if (!sports_played || sports_played.length === 0) {
            return res.status(400).json({ message: 'At least one sport must be selected' });
        }

        const player = new Player({
            full_name, phone_number, password, email,
            age_group, gender, city, preferred_language,
            sports_played, skill_level, preferred_play_time, typical_group_size,
            willing_to_join_others, bring_own_equipment, notifications_opt_in
        });
        await player.save();

        // Auto login after registration
        const token = jwt.sign({ id: player._id, role: 'player' }, 'your_jwt_secret', { expiresIn: '1d' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            player: {
                id: player._id,
                full_name: player.full_name,
                phone_number: player.phone_number
            }
        });
    } catch (error) {
        console.error("Player Registration Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const player = await Player.findOne({ email });
        if (!player) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: player._id, role: 'player' }, 'your_jwt_secret', { expiresIn: '1d' });
        res.json({
            token,
            player: {
                id: player._id,
                full_name: player.full_name,
                phone_number: player.phone_number,
                role: player.role || 'player'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { full_name, phone_number, password } = req.body;
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ message: 'Player not found' });

        if (full_name) player.full_name = full_name;
        if (phone_number) {
            const existing = await Player.findOne({ phone_number, _id: { $ne: req.params.id } });
            if (existing) return res.status(400).json({ message: 'Phone number already in use' });
            player.phone_number = phone_number;
        }
        if (password) {
            player.password = password; // Middleware will hash it
        }

        await player.save();
        res.json({ message: 'Profile updated successfully', player: { id: player._id, full_name: player.full_name, phone_number: player.phone_number } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
