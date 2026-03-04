const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    turf_name: { type: String, required: true },
    location: { type: String, required: true },
    google_map_link: { type: String, default: '' },
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true },
    opening_time: { type: String, default: '06:00' },
    closing_time: { type: String, default: '22:00' },
    slot_duration: { type: Number, default: 60 },
    max_players: { type: Number, default: 22 },
    base_price: { type: Number, default: 500 },
    rules_text: { type: String, default: '' },
    image_url: { type: String, default: '' },
    sport_type: { type: String, default: 'multi-sport' },
    turf_size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    days_open: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    rating: { type: Number, default: 4.5 },
    reviews_count: { type: Number, default: 0 },
    coordinates: {
        lat: { type: Number, default: 19.0760 },
        lng: { type: Number, default: 72.8777 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Turf', turfSchema);
