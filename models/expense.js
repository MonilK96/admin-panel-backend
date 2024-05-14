
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    type: String,
    desc: String,
    date: Date,
    amount: Number,
    company_id: String,
    createdBy: String,
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

module.exports = mongoose.model('Expense', expenseSchema);