const mongoose = require('mongoose');
const moment = require('moment');

const inquirySchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      occupation: String,
      contact: String,
      email: String,
      education: String,
      dob: String,
      address: {
            address_line1: String,
            address_line2: String,
            city: String,
            state: String,
            country: String,
            zip_code:String
      },
      reference_by: String,
      fatherName: String,
      father_contact: String,
      father_occupation: String,
      interested_in: [String],
      suggested_by: String,
      company_id:String,
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
module.exports = mongoose.model('Inquiry', inquirySchema);     


