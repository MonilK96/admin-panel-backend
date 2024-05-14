const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    technology: String,
    batch_time: Date,
    note: String,
    lab_name: String,
    company_id:String,
    batch_members: [{
        student_id: String,
        firstName: String,
        lastName: String,
        contact: String,
        course: String,
        joining_date: Date,
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

module.exports = mongoose.model('Batch', batchSchema);
