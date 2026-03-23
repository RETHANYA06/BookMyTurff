const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Project uses bcryptjs
const User = require("./models/Player"); // Using the Player model as no User model exists
require('dotenv').config(); // Required for process.env.MONGO_URI

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookmyturf");

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("adminpassword", 10);

        const admin = await User.findOneAndUpdate(
            { email: "admin@bookmyturf.com" },
            {
                full_name: "Admin", // Adjusted to 'full_name' as per schema
                email: "admin@bookmyturf.com",
                phone_number: "9999999999",
                password: hashedPassword,
                role: "admin"   // 🔥 VERY IMPORTANT
            },
            { upsert: true, new: true }
        );

        console.log("✅ Admin ready:", admin);
        process.exit();
    } catch (err) {
        console.error("❌ Error setting up admin:", err);
        process.exit(1);
    }
}

createAdmin();
