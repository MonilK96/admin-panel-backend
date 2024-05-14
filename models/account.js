

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    opening_cash: Number,
    withdrawal_amount: Number,
    investment_amount: Number,
    amount: Number,
    company_id: String,
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

module.exports = mongoose.model('Account', accountSchema);