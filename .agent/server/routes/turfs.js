const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const TurfItem = require('../models/TurfItem');
const Slot = require('../models/Slot');

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
