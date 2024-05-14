const mongoose = require('mongoose');
const moment = require('moment');

const companySchema = new mongoose.Schema({
  company_name: String,
  logo_url: String,
  created_at: {
    type: Date,
    default: () => moment().format(),
  },
  updated_at: {
    type: Date,
    default: () => moment().format(),
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Company', companySchema);
