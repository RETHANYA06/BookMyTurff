const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Turf = require('../models/Turf');
const bcrypt = require('bcryptjs');
const TurfItem = require('../models/TurfItem');
const { generateSlotsForDate } = require('../utils/slotHelper');

// Register Manager + Turf Onboarding
router.post('/register', async (req, res) => {
    try {
        const {
            name, phone, email, password,
            turf_name, image_url, location, google_map_link, sport_type, turf_size,
            opening_time, closing_time, slot_duration, max_players, days_open, base_price,
            rules_text, rental_items
        } = req.body;

        console.log("Starting Manager Registration for:", email);

        // 1. Validations
        let existingManager = await Manager.findOne({ $or: [{ email }, { phone }] });
        if (existingManager) {
            console.warn("Registration Attempt: Email or Phone already exists", { email, phone });
            return res.status(400).json({ message: 'Email or Phone already registered' });
        }

        // 2. Create Manager
        const hashedPassword = await bcrypt.hash(password, 10);
        const manager = new Manager({ name, phone, email, password: hashedPassword });
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

        console.log("Manager Registration Successful:", manager._id);
        res.status(201).json({
            manager_id: manager._id,
            turf_id: turf._id,
            name: manager.name,
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
        const { email, password } = req.body;
        const manager = await Manager.findOne({ email }).populate('turf_id');
        if (!manager) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({
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
