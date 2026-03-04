const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    date: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    price: { type: Number, default: 500 },
    status: { type: String, enum: ['available', 'booked', 'blocked', 'pending', 'reserved'], default: 'available' },
    locked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    locked_at: { type: Date, default: null }
}, { timestamps: true });

slotSchema.index({ turf_id: 1, date: 1, start_time: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
