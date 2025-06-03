// backend/db.js

const mongoose = require('mongoose');
require('dotenv').config();  // This loads the .env variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected ✅');
    } catch (error) {
        console.error('MongoDB Connection Failed ❌', error);
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB; // Export the function so you can call it in the backend entry point