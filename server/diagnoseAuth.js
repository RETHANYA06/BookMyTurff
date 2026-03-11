const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const PlayerSchema = new mongoose.Schema({
    full_name: String,
    phone_number: String,
    email: String,
    password: String,
    role: String
}, { collection: 'players' });

const User = mongoose.model('PlayerDiagnostic', PlayerSchema);

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        console.log('Connected to MongoDB');

        const email = 'admin@bookmyturf.com';
        const inputPassword = 'adminpassword';
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User NOT found in database');
        } else {
            console.log('User found:', user.email);
            console.log('Hashed Password in DB:', user.password);
            
            const isMatch = await bcrypt.compare(inputPassword, user.password);
            console.log('Does "adminpassword" match?', isMatch);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Diagnostic error:', error);
        process.exit(1);
    }
};

diagnose();
