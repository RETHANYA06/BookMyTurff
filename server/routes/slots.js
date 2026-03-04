const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const { generateSlotsForDate } = require('../utils/slotHelper');

// Get slots for a turf on a specific date
router.get('/:turfId', async (req, res) => {
    try {
        const { date } = req.query;
        const now = new Date();
        const lockDuration = 3 * 60 * 1000; // 3 minutes

        // Lazy cleanup: Release expired locks
        await Slot.updateMany(
            {
                turf_id: req.params.turfId,
                status: 'reserved',
                locked_at: { $lt: new Date(now - lockDuration) }
            },
            {
                $set: { status: 'available', locked_by: null, locked_at: null }
            }
        );

        const slots = await Slot.find({ turf_id: req.params.turfId, date }).sort({ start_time: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Auto-generate slots for a date
router.post('/generate', async (req, res) => {
    try {
        const { turfId, date } = req.body;
        const turf = await Turf.findById(turfId);
        if (!turf) return res.status(404).json({ message: 'Turf not found' });

        const result = await generateSlotsForDate(
            turfId,
            date,
            turf.opening_time,
            turf.closing_time,
            500, // Default price
            turf.slot_duration || 60
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lock a slot temporarily
router.post('/lock', async (req, res) => {
    const { slotId, playerId } = req.body;
    const lockDuration = 3 * 60 * 1000;
    const now = new Date();

    if (!slotId || !playerId) {
        return res.status(400).json({ message: 'Slot ID and Player ID are required' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(slotId) || !mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const pId = new mongoose.Types.ObjectId(playerId);

        // Find slot that is either available OR has an expired lock OR owned by same player
        const slot = await Slot.findOneAndUpdate(
            {
                _id: slotId,
                $or: [
                    { status: 'available' },
                    {
                        status: 'reserved',
                        locked_at: { $lt: new Date(now - lockDuration) }
                    },
                    {
                        status: 'reserved',
                        locked_by: pId
                    }
                ]
            },
            {
                $set: {
                    status: 'reserved',
                    locked_by: pId,
                    locked_at: now
                }
            },
            { new: true }
        );

        if (!slot) {
            const actualSlot = await Slot.findById(slotId);
            console.log(`Lock failed for slot ${slotId}. Current status: ${actualSlot?.status}, Locked by: ${actualSlot?.locked_by}`);
            return res.status(409).json({
                message: actualSlot?.status === 'booked' ? 'This slot has just been booked' : (actualSlot?.status === 'reserved' ? 'This slot is temporarily reserved by another player' : 'Slot status changed. Please refresh.')
            });
        }

        res.json({ message: 'Slot locked successfully', slot });
    } catch (error) {
        console.error("Slot lock error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Unlock a slot (User deselects)
router.post('/unlock', async (req, res) => {
    const { slotId, playerId } = req.body;
    if (!slotId || !playerId) {
        return res.status(400).json({ message: 'Slot ID and Player ID are required' });
    }
    try {
        if (!mongoose.Types.ObjectId.isValid(slotId) || !mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const pId = new mongoose.Types.ObjectId(playerId);
        const slot = await Slot.findOneAndUpdate(
            { _id: slotId, locked_by: pId, status: 'reserved' },
            { $set: { status: 'available', locked_by: null, locked_at: null } },
            { new: true }
        );
        console.log(`Slot ${slotId} unlocked by player ${playerId}`);
        res.json({ message: 'Slot unlocked', slot });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update slot status/price
router.put('/:id', async (req, res) => {
    try {
        const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
