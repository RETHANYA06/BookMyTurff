const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', default: null },
    role: { type: String, default: 'owner' }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);
