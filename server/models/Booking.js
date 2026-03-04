const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    slot_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true }],
    player_name: { type: String, required: true },
    phone: { type: String, required: true },
    players_count: { type: Number, required: true },
    payment_type: { type: String, enum: ['advance', 'pay_at_turf'], required: true },
    advance_amount: { type: Number, default: 0 },
    instructions_confirmed: { type: Boolean, required: true },
    payment_status: { type: String, enum: ['pending_payment', 'partially_paid', 'fully_paid'], default: 'pending_payment' },
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    booking_owner_type: { type: String, enum: ['registered_player'], default: 'registered_player' },
    status: { type: String, enum: ['booked', 'cancelled', 'completed', 'pending_payment'], default: 'booked' },
    cancel_reason: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
