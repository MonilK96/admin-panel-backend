const handleException = require("../decorators/error");
const attendanceRouter = require("express").Router()
const AttendanceModel = require("../models/attendance");
const StudentModel = require("../models/student");
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");

attendanceRouter.post(
    "/attendance",
    handleException(async (req, res) => {
        try {
            const attendanceDetails = req.body.attendance;
            const data = await AttendanceModel.insertMany(attendanceDetails);

            res.json({
                data: {
                    attendance: data,
                    message: "Data inserted successfully.",
                },
            });
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);


attendanceRouter.get(
    "/:companyId/attendance",
    handleException(async (req, res) => {
        try {
            let query = {deleted_at: null, company_id: req.params.companyId};

            if (req.query.student) {
                query.studentId = req.query.student;
            }

            if (req.query.employee) {
                query.employee_id = req.query.employee;
            }

            if (req.query.startDate && req.query.endDate) {
                const fromDate = new Date(req.query.startDate);
                const toDate = new Date(req.query.endDate);
                const startOfDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
                const endOfDay = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
                query.date = {$gte: startOfDay, $lte: endOfDay};
            }

            const data = await AttendanceModel.find(query);

            res.json({
                data: {
                    attendance: data,
                },
            });
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

attendanceRouter.get(
    "/:companyId/attendance/logs",
    handleException(async (req, res) => {
        try {
            const queryDate = new Date(req.query.date);

            const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
            const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate() + 1);

            let query = {
                deleted_at: null,
                company_id: req.params.companyId,
                date: {
                    $gte: startOfDay,
                    $lt: endOfDay
                },
                status: req.query.type
            };

            const attendances = await AttendanceModel.find(query);
            const studentIds = attendances.map(att => att.studentId);
            const students = await StudentModel.find({_id: {$in: studentIds}});


            const data = attendances.map(att => {
                const student = students.find(std => std._id.toString() === att.studentId.toString());
                return {
                    ...att.toObject(),
                    firstName: student ? student.personal_info.firstName : '',
                    lastName: student ? student.personal_info.lastName : '',
                    contact: student ? student.personal_info.contact : ""
                };
            });

            res.json(data);
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);


module.exports = attendanceRouter;