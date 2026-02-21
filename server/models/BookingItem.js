const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TurfItem', required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('BookingItem', bookingItemSchema);
