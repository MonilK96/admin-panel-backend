const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: String,
    firstName: String,
    lastName: String,
    contact: String,
    email: String,
    password: String,
    avatar_url: String,
    company_id:String,
    other_info: JSON,
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

module.exports = mongoose.model('User', userSchema);