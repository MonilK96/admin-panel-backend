const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    event: String,
    startDate: Date,
    endDate: Date,
    company_id:String,
    event_user_id:String,
    leave_type:String,
    leave_description:String,
    leave_status:String,
    denied_reason:String,
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    },
    deleted_at: {
        type: Date,
        default: null
    },
});

module.exports = mongoose.model('Event', eventSchema);