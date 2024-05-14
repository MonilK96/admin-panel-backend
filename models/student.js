const mongoose = require('mongoose');
const moment = require('moment');

const studentSchema = new mongoose.Schema({
  personal_info: {
    firstName: String,
    lastName: String,
    contact: String,
    email: String,
    dob: String,
    education: String,
    college: String,
    blood_group: String,
    gender: String,
    course: String,
    joining_date: Date,
    profile_pic:String,
  },
  address_info: {
    address_1: String,
    address_2: String,
    city: String,
    state: String,
    country: String,
    zipcode: Number,
  },
  exam_info: [{
    title: String,
    desc: String,
    total_marks: Number,
    obtained_marks: Number,
    conducted_by: String,
    date: Date
  }],
  guardian_info: [{
    relation_type: String,
    firstName: String,
    lastName: String,
    contact: String,
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
  }],
  fees_info: {
    total_amount: Number,
    amount_paid: Number,
    amount_remaining: Number,
    admission_amount: Number,
    upcoming_installment_date: Date,
    upcoming_installment_amount: Number,
    no_of_installments: Number,
    discount: Number,
    installments: [{
      installment_date: Date,
      amount: Number,
      status: String,
      payment_mode: {
        type: String,
        default: "cash"
      },
      payment_date: {
        type: Date,
        default: null
      }
    }]
  },
  remarks: [],
  complaints: [],
  assignmentCompleted: [],
  status: String,
  company_id:String,
  enrollment_no: Number,
  student_user_id: String,
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

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;