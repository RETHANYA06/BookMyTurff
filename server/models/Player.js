const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const playerSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    password: { type: String, required: true },

    // Step 2: Details
    age_group: { type: String, enum: ['under 16', '16-20', '21-25', '26-35', '35+'] },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    city: { type: String },
    preferred_language: { type: String },

    // Step 3: Sports
    sports_played: [{ type: String }],
    skill_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    preferred_play_time: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] },
    typical_group_size: { type: String, enum: ['solo', '2-4 players', '5-7 players', 'full team'] },

    // Step 4: Preferences
    willing_to_join_others: { type: Boolean, default: false },
    bring_own_equipment: { type: Boolean, default: false },
    notifications_opt_in: { type: Boolean, default: true },
    role: { type: String, default: 'player' }
}, { timestamps: true });

playerSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Player', playerSchema);
