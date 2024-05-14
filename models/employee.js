
const mongoose = require('mongoose');

const empSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    contact: String,
    email: String,
    gender: String,
    role: String,
    qualification: String,
    technology: String,
    experience: Number,
    dob: Date,
    joining_date: Date,
    avatar_url: String,
    address: {
        address_1: String,
        address_2: String,
        city: String,
        state: String,
        country: String,
        zipcode: Number,
    },
    company_id:String,
    emp_user_id:String,
    created_at: {
        default: new Date(),
        type: Date
    },
    updated_at: {
        default: new Date(),
        type: Date
    },
    deleted_at: {
        default: null,
        type: Date
    }
});

module.exports = mongoose.model('Employee', empSchema);