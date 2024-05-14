const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    mobileNumber: String,
    email: String,
    password: String,
 });

module.exports = mongoose.model('UserLogin', loginSchema);