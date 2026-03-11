const mongoose = require('mongoose');
const Player = require('./models/Player');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        console.log('Connected to MongoDB');

        const phone_number = '9999999999';
        const password = 'adminpassword';
        
        const existingAdmin = await Player.findOne({ phone_number });
        if (existingAdmin) {
            console.log('Admin already exists with this phone number');
            process.exit(0);
        }

        const admin = new Player({
            full_name: 'System Administrator',
            phone_number: phone_number,
            password: password, // Will be hashed by pre-save middleware
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully!');
        console.log('Phone Number:', phone_number);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
