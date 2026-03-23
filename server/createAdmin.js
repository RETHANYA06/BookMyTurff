const mongoose = require("mongoose");
const User = require("./models/Player"); // Using the Player model which handles admin roles
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf');
        
        const hashedPassword = await bcrypt.hash("adminpassword", 10);

        await User.findOneAndUpdate(
            { email: "admin@bookmyturf.com" },
            {
                full_name: "Admin",
                email: "admin@bookmyturf.com",
                phone_number: "9999999999",
                password: hashedPassword,
                role: "admin"
            },
            { upsert: true, new: true } // 🔥 THIS IS IMPORTANT
        );

        console.log("✅ Admin created/updated successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating/updating admin:", error);
        process.exit(1);
    }
}

createAdmin();
