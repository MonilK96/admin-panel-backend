const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log(`Successfully connected to : ${mongoose.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;
