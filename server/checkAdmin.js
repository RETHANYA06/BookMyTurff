const mongoose = require('mongoose');
const Player = require('./models/Player');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        const admin = await Player.findOne({ role: 'admin' });
        console.log('Admin user:', JSON.stringify(admin, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
check();
