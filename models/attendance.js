const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: String,
    date: Date,
    status: String,
    company_id: String,
    employee_id: String,
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

module.exports = mongoose.model('Attendance', attendanceSchema);