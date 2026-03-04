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
    try {
        const {
            name, phone_number, email, password,
            turf_name, image_url, location, google_map_link, sport_type, turf_size,
            opening_time, closing_time, slot_duration, max_players, days_open, base_price,
            rules_text, rental_items
        } = req.body;

        console.log("Starting Manager Registration for:", phone_number);

        // 1. Validations
        if (!/^[6-9]\d{9}$/.test(phone_number)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        let existingManager = await Manager.findOne({ phone_number });
        let existingPlayer = await Player.findOne({ phone_number });

        if (existingManager || existingPlayer) {
            console.warn("Registration Attempt: Phone already exists globally", { phone_number });
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // 2. Create Manager
        const hashedPassword = await bcrypt.hash(password, 10);
        const manager = new Manager({ name, phone_number, email, password: hashedPassword });
        await manager.save();

        // 3. Create Turf
        const turf = new Turf({
            turf_name,
            image_url,
            location,
            google_map_link,
            sport_type,
            turf_size,
            opening_time,
            closing_time,
            slot_duration: parseInt(slot_duration) || 60,
            max_players: parseInt(max_players) || 22,
            base_price: parseInt(base_price) || 500,
            days_open: days_open || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            rules_text,
            manager_id: manager._id
        });
        await turf.save();

        manager.turf_id = turf._id;
        await manager.save();

        // 4. Create Rental Items
        if (rental_items && rental_items.length > 0) {
            const items = rental_items.map(item => ({
                turf_id: turf._id,
                item_name: item.item_name,
                rent_price: item.rent_price
            }));
            await TurfItem.insertMany(items);
        }

        // 5. Auto-Generate Slots for Next 7 Days
        const generatePromises = [];
        const daysToGenerate = 7;

        for (let i = 0; i < daysToGenerate; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-CA');

            // Check if day is in days_open
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            if (turf.days_open && turf.days_open.includes(dayName)) {
                generatePromises.push(generateSlotsForDate(
                    turf._id,
                    dateStr,
                    opening_time || '06:00',
                    closing_time || '22:00',
                    parseInt(base_price) || 500, // Dynamic base price from registration
                    parseInt(slot_duration) || 60
                ));
            }
        }
        await Promise.all(generatePromises);

        // Create Session Token
        const token = jwt.sign({ id: manager._id, role: manager.role || 'owner' }, 'your_jwt_secret', { expiresIn: '1d' });

        console.log("Manager Registration Successful:", manager._id);
        res.status(201).json({
            token,
            manager_id: manager._id,
            turf_id: turf._id,
            name: manager.name,
            role: manager.role || 'owner',
            turf_name: turf.turf_name
        });
    } catch (error) {
        console.error("Manager Registration CRITICAL Error:", error);
        res.status(500).json({ message: error.message });
    }
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
