const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    password: { type: String, required: true },
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', default: null },
    role: { type: String, default: 'owner' }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);
