const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const TurfItem = require('../models/TurfItem');
const Slot = require('../models/Slot');
const multer = require('multer');
const path = require('path');

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Image Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${encodeURIComponent(req.file.filename)}`;
    res.json({ imageUrl });
});

const jwt = require('jsonwebtoken');

// Middleware to authorize Owner
const authenticateOwner = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const decoded = jwt.verify(token, 'your_jwt_secret');
        if (decoded.role !== 'owner') {
            return res.status(403).json({ message: 'Only turf owners can create turfs' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const Manager = require('../models/Manager');
const { generateSlotsForDate } = require('../utils/slotHelper');

// Create a new Turf (Owner only)
router.post('/', authenticateOwner, async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only turf owners can create turfs' });
        }

        const {
            turf_name, image_url, location, google_map_link, sport_type, turf_size,
            opening_time, closing_time, slot_duration, max_players, days_open, base_price,
            rules_text, rental_items
        } = req.body;

        const managerId = req.user.id;

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
            manager_id: managerId
        });
        
        await turf.save();

        // Update Manager with turf ID
        await Manager.findByIdAndUpdate(managerId, { turf_id: turf._id });

        if (rental_items && rental_items.length > 0) {
            const items = rental_items.map(item => ({
                turf_id: turf._id,
                item_name: item.item_name,
                rent_price: item.rent_price
            }));
            await TurfItem.insertMany(items);
        }

        const generatePromises = [];
        const daysToGenerate = 7;

        for (let i = 0; i < daysToGenerate; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-CA');

            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            if (turf.days_open && turf.days_open.includes(dayName)) {
                generatePromises.push(generateSlotsForDate(
                    turf._id,
                    dateStr,
                    opening_time || '06:00',
                    closing_time || '22:00',
                    parseInt(base_price) || 500,
                    parseInt(slot_duration) || 60
                ));
            }
        }
        await Promise.all(generatePromises);

        res.status(201).json({ message: 'Turf created successfully', turf });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all turfs with summary (Public with Search/Filter)
router.get('/', async (req, res) => {
    try {
        const { name, location, sport_type, min_price, max_price, available_today, min_rating } = req.query;
        let query = {};

        if (name) query.turf_name = { $regex: name, $options: 'i' };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (sport_type && sport_type !== 'All') query.sport_type = sport_type;
        if (min_rating) query.rating = { $gte: parseFloat(min_rating) };

        let turfs = await Turf.find(query);
        const todayStr = new Date().toLocaleDateString('en-CA');

        // Enhance turfs with summary info
        let enhancedTurfs = await Promise.all(turfs.map(async (turf) => {
            const slots = await Slot.find({ turf_id: turf._id, date: todayStr, status: 'available' }).sort({ start_time: 1 });

            const startingPrice = slots.length > 0 ? Math.min(...slots.map(s => s.price)) : (turf.base_price || 500);

            if (min_price && startingPrice < parseInt(min_price)) return null;
            if (max_price && startingPrice > parseInt(max_price)) return null;
            if (available_today === 'true' && slots.length === 0) return null;

            return {
                ...turf._doc,
                available_slots_today: slots.length,
                next_slot: slots[0] ? slots[0].start_time : null,
                starting_price: startingPrice
            };
        }));

        res.json(enhancedTurfs.filter(t => t !== null));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get turf by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);
        const items = await TurfItem.find({ turf_id: req.params.id });
        res.json({ ...turf._doc, items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update turf settings (Manager only)
router.put('/:id', async (req, res) => {
    try {
        const turf = await Turf.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(turf);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add rentable items
router.post('/:id/items', async (req, res) => {
    try {
        const item = new TurfItem({ turf_id: req.params.id, ...req.body });
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete rentable item
router.delete('/items/:itemId', async (req, res) => {
    try {
        await TurfItem.findByIdAndDelete(req.params.itemId);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get turfs available today (Sorted by available count)
router.get('/available-today/list', async (req, res) => {
    try {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const turfs = await Turf.find();

        const availableTurfs = await Promise.all(turfs.map(async (turf) => {
            const slots = await Slot.find({ turf_id: turf._id, date: todayStr, status: 'available' }).sort({ start_time: 1 });
            if (slots.length > 0) {
                return {
                    ...turf._doc,
                    available_count: slots.length,
                    next_slot: slots[0].start_time,
                    starting_price: Math.min(...slots.map(s => s.price))
                };
            }
            return null;
        }));

        res.json(availableTurfs.filter(t => t !== null).sort((a, b) => b.available_count - a.available_count));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
