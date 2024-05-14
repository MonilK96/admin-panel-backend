const mongoose = require('mongoose');
const moment = require('moment');

const demoSchema = new mongoose.Schema({
  entries: [
    {
      faculty_name: String,
      note: String,
      date: Date,
      time: String,
      status: String,
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
    }
  ],
  inquiry_id: String,
  fullName: String,
  contact: String,
  email: String,
  company_id:String,
  interested_in: [String],
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

module.exports = mongoose.model('Demo', demoSchema);
