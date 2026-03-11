const mongoose = require('mongoose');
const Player = require('./models/Player');
const dotenv = require('dotenv');

dotenv.config();

const updateAdminEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        console.log('Connected to MongoDB');

        const phone_number = '9999999999';
        const email = 'admin@bookmyturf.com';
        
        const admin = await Player.findOne({ phone_number });
        if (!admin) {
            console.log('Admin not found');
            process.exit(0);
        }

        admin.email = email;
        await admin.save();
        
        console.log('Admin email updated successfully!');
        console.log('Email:', email);
        console.log('Password: adminpassword');
        process.exit(0);
    } catch (error) {
        console.error('Error updating admin:', error);
        process.exit(1);
    }
};

updateAdminEmail();
