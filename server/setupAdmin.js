const mongoose = require('mongoose');
const Player = require('./models/Player');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function setup() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        
        const email = 'admin@bookmyturf.com';
        const phone = '9999999999';
        
        // Find by role or phone or email
        let admin = await Player.findOne({ $or: [{ role: 'admin' }, { phone_number: phone }, { email: email }] });
        
        if (admin) {
            console.log('Updating existing admin...');
            admin.email = email;
            admin.role = 'admin';
            admin.phone_number = phone;
            // Not changing password here to keep it safe if it was already hashed, 
            // but for this task let's ensure it's 'adminpassword' if we want to be sure.
            const bcrypt = require('bcryptjs');
            admin.password = 'adminpassword'; // Pre-save hook will hash it
            await admin.save();
            console.log('Admin updated.');
        } else {
            console.log('Creating new admin...');
            admin = new Player({
                full_name: 'System Administrator',
                phone_number: phone,
                email: email,
                password: 'adminpassword',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin created.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
setup();
