const mongoose = require('mongoose');

const turfItemSchema = new mongoose.Schema({
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    item_name: { type: String, required: true },
    rent_price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TurfItem', turfItemSchema);
