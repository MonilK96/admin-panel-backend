const mongoose = require('mongoose');
const moment = require('moment');

const seminarSchema = new mongoose.Schema({
    title: String,
    date_time: Date,
    company_id: String,
    schedule_by :String,
    attended_role:String,
    attended_by: [{
        attended_id: String,
        firstName: String,
        lastName: String,
        contact: String,
        role:String,
        attended_status: {
            type: String,
            default: 'absent'
        },
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
    }],
    other_info: JSON,
    created_at: {
        type: Date,
        default: () => moment().format()
    },
    updated_at: {
        type: Date,
        default: () => moment().format()
    },
    deleted_at: {
        type: Date,
        default: null
    }
});
  
module.exports = mongoose.model('Seminar', seminarSchema);