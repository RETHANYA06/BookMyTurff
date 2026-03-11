const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Create a small schema locally to avoid middleware interference
const PlayerSchema = new mongoose.Schema({
    full_name: String,
    phone_number: String,
    email: String,
    password: String,
    role: String
}, { collection: 'players' });

const User = mongoose.model('PlayerReset', PlayerSchema);

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        console.log('Connected to MongoDB');

        const email = 'admin@bookmyturf.com';
        const password = 'adminpassword';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.updateOne(
            { email: email },
            { $set: { password: hashedPassword, role: 'admin' } },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log('Admin account created with hashed password.');
        } else {
            console.log('Admin account updated with new hashed password.');
        }

        console.log('Credentials:');
        console.log('Email:', email);
        console.log('Password:', password);
        
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
};

resetAdmin();
