const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    player_name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
