const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const BookingItem = require('../models/BookingItem');
const TurfItem = require('../models/TurfItem');

// Create Booking (Public)
router.post('/', async (req, res) => {
    try {
        const { turf_id, slot_ids, player_name, phone, players_count, payment_type, advance_amount, player_id, booking_owner_type, items } = req.body;

        // 1. Validate Input
        if (!player_name || !phone || !players_count || !slot_ids || slot_ids.length === 0 || !player_id) {
            return res.status(400).json({ message: 'Name, Phone, Players Count, Slots and Player ID are required' });
        }

        // 2. Fetch Turf & Slots
        const turf = await Turf.findById(turf_id);
        const slots = await Slot.find({ _id: { $in: slot_ids } }).sort({ start_time: 1 });

        if (!turf || slots.length !== slot_ids.length) {
            return res.status(400).json({ message: 'Invalid Turf or Slots' });
        }

        // 3. Player Count Validation
        if (players_count > turf.max_players) {
            return res.status(400).json({ message: `Players count cannot exceed ${turf.max_players}` });
        }

        // 4. Availability Check
        const lockDuration = 3 * 60 * 1000;
        const now = new Date();

        for (const slot of slots) {
            const isReservedByMe = slot.status === 'reserved' &&
                slot.locked_by?.toString() === player_id &&
                slot.locked_at && (now - slot.locked_at) < lockDuration;

            if (slot.status !== 'available' && !isReservedByMe) {
                return res.status(400).json({ message: `Slot ${slot.start_time} is no longer available` });
            }
        }

        // 5. Past Time Check
        const todayStr = new Date().toLocaleDateString('en-CA');
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        for (const slot of slots) {
            if (slot.date === todayStr && slot.start_time < currentTimeStr) {
                return res.status(400).json({ message: `Cannot book a past time slot: ${slot.start_time}` });
            }
        }

        // 6. Continuity Validation
        const dates = [...new Set(slots.map(s => s.date))];
        if (dates.length > 1) {
            return res.status(400).json({ message: 'All slots must be on the same date' });
        }

        // 7. Payment Logic
        const payment_status = payment_type === 'advance' ? 'partially_paid' : 'pending_payment';

        const booking = new Booking({
            turf_id,
            slot_ids,
            player_name,
            phone,
            players_count,
            payment_type,
            advance_amount: payment_type === 'advance' ? advance_amount : 0,
            instructions_confirmed: true,
            status: 'pending_payment',
            payment_status,
            player_id,
            booking_owner_type: 'registered_player'
        });
        await booking.save();

        // 8. Handle Rental Items
        if (items && Object.keys(items).length > 0) {
            const bookingItems = Object.entries(items).map(([itemId, quantity]) => ({
                booking_id: booking._id,
                item_id: itemId,
                quantity
            })).filter(item => item.quantity > 0);

            if (bookingItems.length > 0) {
                await BookingItem.insertMany(bookingItems);
            }
        }

        // 9. Update Slots
        await Slot.updateMany(
            { _id: { $in: slot_ids } },
            { $set: { status: 'booked', locked_by: null, locked_at: null } }
        );

        // Return populated booking
        const populatedBooking = await Booking.findById(booking._id)
            .populate('turf_id')
            .populate('slot_ids');

        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: error.message });
    }
});


// QUICK ACTIONS ABOVE GENERIC ROUTES
// Get bookings for a player
router.get('/player/:playerId', async (req, res) => {
    try {
        const bookings = await Booking.find({ player_id: req.params.playerId })
            .populate('turf_id')
            .populate('slot_ids')
            .sort({ created_at: -1 })
            .lean();

        const enrichedBookings = await Promise.all(bookings.map(async (b) => {
            const items = await BookingItem.find({ booking_id: b._id }).populate('item_id');
            return { ...b, rental_items: items };
        }));

        res.json(enrichedBookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Earning analytics
router.get('/earnings/:turfId', async (req, res) => {
    try {
        const bookings = await Booking.find({ turf_id: req.params.turfId }).populate('slot_ids');
        const today = new Date().toISOString().split('T')[0];

        const stats = {
            todayBookings: 0,
            advanceCollected: 0,
            pendingPayments: 0,
            cancelledCount: 0
        };

        bookings.forEach(b => {
            const isToday = b.slot_ids?.some(s => s.date === today);

            if (b.status === 'booked' || b.status === 'completed') {
                if (isToday) stats.todayBookings++;
                stats.advanceCollected += (b.advance_amount || 0);
                if (b.payment_status === 'pending_payment' || b.payment_status === 'partially_paid') {
                    const totalPrice = b.slot_ids?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;
                    stats.pendingPayments += Math.max(0, totalPrice - (b.advance_amount || 0));
                }
            } else if (b.status === 'cancelled') {
                stats.cancelledCount++;
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get bookings for a turf (Manager)
router.get('/:turfId', async (req, res) => {
    try {
        const bookings = await Booking.find({ turf_id: req.params.turfId })
            .populate('slot_ids')
            .sort({ created_at: -1 })
            .lean();

        // Manually populate items for each booking (easier than complex aggregate for now)
        const enrichedBookings = await Promise.all(bookings.map(async (b) => {
            const items = await BookingItem.find({ booking_id: b._id }).populate('item_id');
            return { ...b, rental_items: items };
        }));

        res.json(enrichedBookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update booking status (Manager/Player/Admin)
router.put('/:id', async (req, res) => {
    try {
        const { status, cancel_reason, payment_status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (status) {
            if (status === 'cancelled' && booking.status !== 'cancelled') {
                await Slot.updateMany({ _id: { $in: booking.slot_ids } }, { status: 'available' });
                booking.cancel_reason = cancel_reason || (booking.player_id ? 'cancelled_by_player' : 'Cancelled by manager');
            }
            booking.status = status;
        }

        if (status === 'completed') {
            booking.payment_status = 'fully_paid';
        }

        if (payment_status) {
            booking.payment_status = payment_status;
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Public Cancellation (Guest or Player via ID)
router.post('/public-cancel', async (req, res) => {
    try {
        const { bookingId, phone, reason } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.phone !== phone) return res.status(401).json({ message: 'Phone number does not match' });
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        await Slot.updateMany({ _id: { $in: booking.slot_ids } }, { status: 'available' });

        booking.status = 'cancelled';
        booking.cancel_reason = reason || 'Publicly cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Quick Action: Mark Complete & Paid
router.post('/:id/complete', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'completed';
        booking.payment_status = 'fully_paid';
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Player Dashboard Data
router.get('/player-dashboard/:playerId', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Upcoming booking
        let upcoming = await Booking.findOne({
            player_id: req.params.playerId,
            status: { $in: ['booked', 'pending_payment'] }
        })
            .populate('turf_id')
            .populate('slot_ids')
            .sort({ created_at: -1 })
            .lean();

        if (upcoming) {
            const items = await BookingItem.find({ booking_id: upcoming._id }).populate('item_id');
            upcoming.rental_items = items;
        }

        // 2. Quick book again (Recent Turfs)
        const recentBookings = await Booking.find({ player_id: req.params.playerId })
            .populate('turf_id')
            .sort({ created_at: -1 })
            .limit(10);

        const recentTurfs = [];
        const seen = new Set();
        recentBookings.forEach(b => {
            if (b.turf_id && !seen.has(b.turf_id._id.toString())) {
                recentTurfs.push(b.turf_id);
                seen.add(b.turf_id._id.toString());
            }
        });
        res.json({
            upcoming,
            recentTurfs: recentTurfs.slice(0, 4)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ALL bookings (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('turf_id')
            .populate('slot_ids')
            .sort({ created_at: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
