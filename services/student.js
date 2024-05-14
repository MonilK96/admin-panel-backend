const BaseService = require(".")
const Student = require("../models/student");
const User = require("../models/User");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");
const {createHash} = require("../common/hash");

class StudentService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async createStudent(companyId, result) {
        const {
            firstName,
            lastName,
            email,
            contact,
            dob,
            education,
            college,
            blood_group,
            gender,
            course,
            joining_date,
            profile_pic,
            address_1,
            address_2,
            city,
            state,
            country,
            zipcode,
            total_amount,
            amount_paid,
            amount_remaining,
            admission_amount,
            upcoming_installment_date,
            upcoming_installment_amount,
            guardian_info,
            discount,
            no_of_installments
        } = this.req;

        const isStudentExists = await Student.exists({
            deleted_at: null,
            $or: [{"personal_info.contact": contact}, {"personal_info.email": email}],
        }).select("_id");

        if (isStudentExists) {
            throw new BadRequestError("Student with this information already exists.");
        }

        let sanitizedContact = contact.replace(/[^\d]/g, '');
        if (sanitizedContact.startsWith('91') && sanitizedContact.length === 12) {
            sanitizedContact = sanitizedContact.substring(2);
        }
        const encryptedPassword = await createHash(sanitizedContact);

        const user = new User({
            firstName,
            lastName,
            email,
            contact,
            role: "Student",
            password: encryptedPassword,
            avatar_url: result,
            company_id: companyId,
        });

        const [savedUser, totalStudents] = await Promise.all([
            user.save(),
            Student.countDocuments({company_id: companyId})
        ]);

        const studentData = {
            personal_info: {
                firstName, lastName, email, contact, dob,
                education, college, blood_group, gender, course,
                joining_date, profile_pic: result
            },
            address_info: {
                address_1, address_2, city, state, country, zipcode
            },
            guardian_info,
            fees_info: installmentData({
                discount,
                no_of_installments,
                total_amount,
                amount_paid,
                amount_remaining,
                admission_amount,
                upcoming_installment_date,
                upcoming_installment_amount,
            }),
            company_id: companyId,
            status: "Running",
            enrollment_no: totalStudents + 1,
            student_user_id: savedUser._id
        };

        const student = await Student.create(studentData);

        return student;
    }


    async getStudents(companyId) {
        let query = {deleted_at: null, company_id: companyId};

        const searchKey = this.reqQuery.searchKey;

        if (searchKey) {
            query = {
                deleted_at: null,
                $or: [
                    {"personal_info.firstName": {$regex: new RegExp(searchKey, 'i')}},
                    {"personal_info.lastName": {$regex: new RegExp(searchKey, 'i')}},
                    {"personal_info.contact": {$regex: new RegExp(searchKey, 'i')}},
                    {"personal_info.email": {$regex: new RegExp(searchKey, 'i')}}
                ]
            };
        }

        let students;
        let total;

        if (this.reqQuery.page && this.reqQuery.limit) {
            const page = parseInt(this.reqQuery.page) || 1;
            const limit = parseInt(this.reqQuery.limit) || 10;
            const startIndex = (page - 1) * limit;

            students = await Student.find(query)
                .skip(startIndex)
                .limit(limit);

            total = await Student.countDocuments(query);
        } else {
            students = await Student.find(query);
            total = students.length;
        }

        const filteredStudent = students.map(demo => ({
            ...demo.toObject(),
            guardian_info: demo.guardian_info.filter(entry => entry.deleted_at === null)
        }));

        return {filteredStudent, total};
    }


    async getStudent(id) {
        const studentId = id;
        const student = await Student.findOne({
            _id: studentId,
            deleted_at: null
        });

        if (!student) {
            throw new ResourceNotFoundError('Student not found.');
        }

        student.guardian_info = student.guardian_info.filter(entry => entry.deleted_at === null);

        return student;
    }

    async updateStudent(userId) {

        const student = await Student.findByIdAndUpdate(userId, {$set: this.req}, {new: true});

        if (!student) {
            throw new ResourceNotFoundError('Student not found');
        }

        if (this.req.firstName || this.req.contact) {

            let sanitizedContact = this.req.personal_info.contact.replace(/[^\d]/g, '');
            if (sanitizedContact.startsWith('91') && sanitizedContact.length === 12) {
                sanitizedContact = sanitizedContact.substring(2);
            }
            const encryptedPassword = await createHash(sanitizedContact);

            await User.findOneAndUpdate({_id: student.student_user_id}, {
                $set: {
                    firstName: this.req.personal_info.firstName,
                    lastName: this.req.personal_info.lastName,
                    contact: this.req.personal_info.contact,
                    email: this.req.personal_info.email,
                    password: encryptedPassword,
                },
                $currentDate: {updated_at: true}
            }, {new: true});

            return student;
        } else {
            return student
        }
    }

    async deleteStudent(userId) {

        const deletedStudent = await Student.findByIdAndUpdate(
            userId,
            {$set: {deleted_at: new Date()}},
            {new: true}
        );

        if (!deletedStudent) {
            this.res.status(404);
            throw new ResourceNotFoundError("Student not found");
        }

        await User.findOneAndUpdate(
            {_id: deletedStudent.student_user_id},
            {$set: {deleted_at: new Date()}},
            {new: true}
        );

        return deletedStudent;
    }

    async deleteStudentGuardian(userId, entryId) {


        const student = await Student.findById(userId);

        if (!student) {
            throw new ResourceNotFoundError("Student not found");
        }

        const guardianIndex = await Student.findOneAndUpdate(
            {_id: userId, 'guardian_info._id': entryId},
            {
                $set: {
                    'guardian_info.$.deleted_at': new Date()
                }
            },
            {
                new: true
            }
        );

        if (!guardianIndex) {
            throw new ResourceNotFoundError("Guardian not found");
        }

        return guardianIndex;

    }

    async updateStudentGuardian(userId, guardianId) {

        const student = await Student.findById(userId);

        if (!student) {
            throw new ResourceNotFoundError("Student not found");
        }

        const guardianIndex = await Student.findOneAndUpdate(
            {_id: userId, 'guardian_info._id': guardianId},
            {
                $set: {
                    'guardian_info.$.firstName': this.req.firstName,
                    'guardian_info.$.lastName': this.req.lastName,
                    'guardian_info.$.contact': this.req.contact,
                }
            },
            {
                new: true
            }
        );

        if (!guardianIndex) {
            throw new ResourceNotFoundError("Guardian not found");
        }

        return student;


    }

    async updateFeesDetails(userId, feesId) {
        const student = await Student.findById(userId);
        if (!student) {
            throw new ResourceNotFoundError("Student not found");
        }

        const installmentToUpdate = student?.fees_info?.installments.find(installment => installment?._id.equals(feesId));
        if (!installmentToUpdate) {
            throw new ResourceNotFoundError("Installment not found");
        }

        const expectedInstallmentAmount = installmentToUpdate.amount;
        const shortfall = expectedInstallmentAmount - this.req.payment_amount;
        const remainingInstallments = student.fees_info.installments.filter(installment => installment.status !== 'Paid').length - 1;
        let adjustedInstallmentAmount

        if (this.req.status === 'Paid') {
            if (shortfall >= 0) {
                adjustedInstallmentAmount = expectedInstallmentAmount + (shortfall / remainingInstallments);
            } else {
                adjustedInstallmentAmount = expectedInstallmentAmount - (shortfall / remainingInstallments);
            }

            student.fees_info.amount_paid += this.req.payment_amount;
            student.fees_info.amount_remaining -= this.req.payment_amount;
            installmentToUpdate.status = this.req.status;
            installmentToUpdate.amount = this.req.payment_amount;
            installmentToUpdate.payment_date = new Date();

            student.fees_info.installments.forEach(installment => {
                if (!installment._id.equals(feesId) && installment.status !== 'Paid') {
                    installment.amount = adjustedInstallmentAmount;
                }
            });
        } else {
            installmentToUpdate.status = this.req.status;
            student.fees_info.amount_paid -= this.req.payment_amount;
            student.fees_info.amount_remaining += this.req.payment_amount;
            installmentToUpdate.payment_date = null;
        }

        const updatedStudent = await Student.findByIdAndUpdate(userId, {fees_info: student.fees_info}, {new: true});

        return updatedStudent;
    }


    async deleteMultipleStudents() {
        const idsToDelete = this.req.body.ids;
        const result = await Student.updateMany(
            {_id: {$in: idsToDelete}},
            {$set: {deleted_at: new Date()}}
        );
        return result;
    }
}

function installmentData(fees_info) {
    const {
        discount,
        no_of_installments,
        total_amount,
        amount_paid,
        amount_remaining,
        admission_amount,
        upcoming_installment_date,
        upcoming_installment_amount
    } = fees_info

    const installmentsArray = [{
        installment_date: Date.now(),
        amount: Number(amount_paid) + Number(admission_amount) + Number(discount),
        status: "Paid",
        payment_date: Date.now()
    }];

    let currentDate = new Date(upcoming_installment_date);

    for (let i = 1; i <= Number(no_of_installments); i++) {
        const installmentDue = {
            amount: Math.round(Number(amount_remaining) / Number(no_of_installments)),
            status: "Pending",
            installment_date: currentDate.getTime(),
        };

        installmentsArray.push(installmentDue);

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const feesData = {
        amount_paid: Number(amount_paid),
        amount_remaining: Number(amount_remaining),
        total_amount: Number(total_amount),
        no_of_installments: Number(no_of_installments),
        discount: Number(discount),
        admission_amount: Number(admission_amount),
        installments: installmentsArray
    }

    return feesData
}


module.exports = StudentService