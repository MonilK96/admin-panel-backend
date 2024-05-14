const mongoose = require('mongoose');
const BaseService = require('.');
const Seminar = require('../models/seminar');
const User = require('../models/User');
const moment = require('moment');
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");

class SeminarService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async createSeminar(companyId) {
        const { title, date_time, schedule_by, attended_by,attended_role } = this.req;

        const populatedSeminarMembers = await Promise.all(
            attended_by.map(async (member) => {
                const { attended_id } = member;
                const userDetails = await User.findOne({ "_id": attended_id });

                if (userDetails) {
                    const { firstName, lastName, contact, role } = userDetails;
                    return {
                        attended_id,
                        firstName,
                        lastName,
                        contact,
                        role
                    };
                } else {
                    throw new ResourceNotFoundError(`User not found with ID: ${attended_id}`);
                }
            })
        );

        const newSeminar = new Seminar({
            title,
            date_time,
            schedule_by,
            company_id: companyId,
            attended_role,
            attended_by: populatedSeminarMembers,
        });

        const savedSeminar = await newSeminar.save();
        return savedSeminar;
    }

    async getUserWiseSeminar(companyId, attendedId) {
        if (!mongoose.Types.ObjectId.isValid(attendedId)) {
            throw new BadRequestError('Invalid user ID');
        }

        const page = parseInt(this.reqQuery.page) || 1;
        const pageSize = parseInt(this.reqQuery.pageSize) || 10;

        const user = await User.findOne({ _id: attendedId, company_id: companyId, deleted_at: null });

        if (!user) {
            throw new ResourceNotFoundError('User not found');
        }

        let query = { deleted_at: null, company_id: companyId };

        const searchKey = this.req.query.searchKey;

        if (searchKey) {
            query = {
                deleted_at: null,
                $or: [
                    { schedule_by: { $regex: new RegExp(searchKey, 'i') } },
                    { title: { $regex: new RegExp(searchKey, 'i') } },
                ],
            };
        }

        const totalDataCount = await Seminar.countDocuments(query);
        const totalPages = Math.ceil(totalDataCount / pageSize);

        const seminars = await Seminar.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize)

        const filteredSeminars = seminars.map(seminar => {
            if (user.role !== 'Admin') {
                seminar.attended_by = seminar.attended_by.filter(attended => attended.deleted_at === null && attended.attended_id === attendedId);
            } else {
                seminar.attended_by = seminar.attended_by.filter(attended => attended.deleted_at === null);
            }
            return seminar;
        });

        return {
            seminars: filteredSeminars,
            totalData: totalDataCount,
            totalPages,
            currentPage: page,
            pageSize,
        };
    }

    async getSeminar(companyId, seminarId, attendedId) {
        const page = parseInt(this.reqQuery.page) || 1;
        const pageSize = parseInt(this.reqQuery.pageSize) || 10;

        const user = await User.findOne({ _id: attendedId, company_id: companyId, deleted_at: null });

        if (!user) {
            throw new ResourceNotFoundError('User not found');
        }

        const seminars = await Seminar.find({
            deleted_at: null,
            company_id: companyId,
            _id: seminarId,
        });

        const searchKey = this.req.query.searchKey;

        const filteredSeminars = seminars.map(seminar => {
            let filteredAttendees = seminar.attended_by;

            if (searchKey) {
                filteredAttendees = seminar.attended_by.filter(attended => {
                    const fullName = `${attended.firstName} ${attended.lastName}`;
                    return (
                        fullName.toLowerCase().includes(searchKey.toLowerCase()) ||
                        attended.attended_status.toLowerCase().includes(searchKey.toLowerCase())
                    );
                });
            }

            if (user.role !== 'Admin') {
                seminar.attended_by = filteredAttendees.filter(attended => attended.deleted_at === null && attended.attended_id === attendedId);
            } else {
                seminar.attended_by = filteredAttendees.filter(attended => attended.deleted_at === null);
            }

            return seminar;
        });

        const totalseminarMembers = seminars.reduce((total, seminar) => total + seminar.attended_by.length, 0);

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedSeminars = filteredSeminars.slice(startIndex, endIndex);

        return {
            seminars: paginatedSeminars,
            totalData: totalseminarMembers,
            totalPages: Math.ceil(totalseminarMembers / pageSize),
            currentPage: page,
            pageSize,
        };
    }

    async updateSeminar(seminarId) {

        const seminar = await Seminar.findById(seminarId);

        if (!seminar) {
            throw new ResourceNotFoundError('Seminar not found');
        }

        if (this.req.body.attended_by && Array.isArray(this.req.body.attended_by)) {
            for (const attendee of this.req.body.attended_by) {
                const user = await User.findById(attendee.attended_id);
                if (user) {
                    attendee.firstName = user.firstName;
                    attendee.lastName = user.lastName;
                    attendee.contact = user.contact;
                    attendee.role = user.role;
                }
            }
        }

        const updatedSeminar = await Seminar.findByIdAndUpdate(seminarId, this.req.body, { new: true });

        if (!updatedSeminar) {
            throw new BadRequestError('Failed to update seminar');
        }

        return updatedSeminar;
    }

    async deleteSeminar(seminarId) {
        const deleteTask = await Seminar.findByIdAndUpdate(
            seminarId,
            { deleted_at: new Date() },
            { new: true }
        );

        if (!deleteTask) {
            throw new ResourceNotFoundError('Task not found');
        }

        return deleteTask;
    }

    async deleteSeminarAttended(seminarId, attendedId) {

        if (!mongoose.Types.ObjectId.isValid(seminarId) || !mongoose.Types.ObjectId.isValid(attendedId)) {
            throw new BadRequestError('Invalid Seminar ID or attended ID');
        }

        const seminar = await Seminar.findById(seminarId);

        if (!seminar) {
            throw new ResourceNotFoundError("Seminar not found");
        }

        const seminarIndex = await Seminar.findOneAndUpdate(
            { _id: seminarId, 'attended_by._id': attendedId },
            {
                $set: {
                    'attended_by.$.deleted_at': new Date()
                }
            },
            {
                new: true
            }
        );

        if (!seminarIndex) {
            throw new ResourceNotFoundError("Batch Member not found");
        }

        return seminarIndex;
    }

    async seminarOverView(companyId) {
        const selectedMonth = this.reqQuery.month ? moment(this.reqQuery.month) : moment();

        const currentMonthStart = selectedMonth.startOf('month').toDate();
        const currentMonthEnd = selectedMonth.endOf('month').toDate();


        const seminars = await Seminar.find({
            company_id: companyId,
            deleted_at: null,
            date_time: {
                $gte: currentMonthStart,
                $lte: currentMonthEnd,
            },
        });

        const seminarOverViewData = seminars.map(seminar => {
            const presentCount = seminar.attended_by.filter(attendee => attendee.attended_status === 'present').length;
            const absentCount = seminar.attended_by.filter(attendee => attendee.attended_status === 'absent').length;

            return {
                seminar_id: seminar._id,
                title: seminar.title,
                date_time: seminar.date_time,
                present_count: presentCount,
                absent_count: absentCount,
                total: presentCount + absentCount
            };
        });

        return seminarOverViewData;
    }


    // async seminarOverView(companyId) {
    //     const selectedMonth = this.reqQuery.month ? moment(this.reqQuery.month) : moment();
    
    //     const currentMonthStart = selectedMonth.startOf('month').toDate();
    //     const currentMonthEnd = selectedMonth.endOf('month').toDate();
    
    //     const seminars = await Seminar.find({
    //         company_id: companyId,
    //         deleted_at: null,
    //         date_time: {
    //             $gte: currentMonthStart,
    //             $lte: currentMonthEnd,
    //         },
    //     });
    
    //     const seminarOverViewData = seminars.map(seminar => {
    //         const presentCount = seminar.attended_by.filter(attendee => attendee.attended_status === 'present').length;
    //         const absentCount = seminar.attended_by.filter(attendee => attendee.attended_status === 'absent').length;
    
    //         // Function to pad a number with leading zeros
    //         const padWithZeros = (number) => number.toString().padStart(2, '0');
    
    //         return {
    //             seminar_id: seminar._id,
    //             title: seminar.title,
    //             date_time: seminar.date_time,
    //             present_count: padWithZeros(presentCount),
    //             absent_count: padWithZeros(absentCount),
    //             total: padWithZeros(presentCount + absentCount),
    //         };
    //     });
    
    //     return seminarOverViewData;
    // }

    async deletemultipleSeminar (){
        const idsToDelete = this.req.body.ids;  
        const result = await Seminar.updateMany(
            { _id: { $in: idsToDelete } },
            { $set: { deleted_at: new Date() } }
        );
        return result;
    }

}

module.exports = SeminarService;
