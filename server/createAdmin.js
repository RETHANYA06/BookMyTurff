require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Project uses bcryptjs
const User = require("./models/Player"); // Using the Player model as no User model exists

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
                role: "admin"
            },
            { upsert: true, new: true }
        );

        console.log("✅ Admin created in DB:", admin);
        process.exit();
    } catch (err) {
        console.error("❌ Error creating admin:", err);
        process.exit(1);
    }
}

createAdmin();
