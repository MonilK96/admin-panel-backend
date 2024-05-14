const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    company_id: String,
    expenses: [],
    roles: [],
    courses: [],
    classrooms: [],
    emp_type: [],
    developer_type: [],
    company_details: {}
});

module.exports = mongoose.model('Config', configSchema);
