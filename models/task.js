const mongoose = require('mongoose');
const moment = require('moment');

const taskSchema = new mongoose.Schema({
    role:String,
    assign_id: String,
    task_title: String,
    create_date: Date,
    due_date: Date,
    priority:String,
    status: String,
    fullName:String,
    company_id:String,
    task_info: [{
        task: String,
        queries: String
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

module.exports = mongoose.model('Task', taskSchema);
