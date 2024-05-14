const handleException = require("../decorators/error");
const feesRouter = require("express").Router()
const StudentModel = require('../models/student')
const mongoose = require("mongoose");
const StudentService = require("../services/student");
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");


// const CreateEventRequest = Joi.object({
//     event: Joi.string(),
//     startDate: Joi.date().required(),
//     endDate: Joi.date().required(),
//     event_user_id: Joi.string().required(),
//     leave_type: Joi.string().required(),
//     leave_description: Joi.string(),
//     leave_status: Joi.string(),
// });
//
// const UpdateEventRequest = Joi.object({
//     event: Joi.string(),
//     startDate: Joi.date(),
//     endDate: Joi.date(),
//     event_user_id: Joi.string(),
//     leave_type: Joi.string(),
//     leave_description: Joi.string(),
//     leave_status: Joi.string(),
//     denied_reason:Joi.string()
// });

// feesRouter.post("/:companyId/event",handleException(async (req, res) => {
//         try {
//             const reqBody = await CreateEventRequest.validateAsync(req.body);
//             const eventServ = new EventService(reqBody, req.user, req.query);
//             const companyId = req.params.companyId;
//             const eventId = await eventServ.addEvent(companyId);
//
//             res.json({
//                 data: {
//                     message: "Event added successfully.",
//                     id: eventId,
//                 },
//             });
//         } catch (err) {
//             throw err;
//         }
//     })
// );

feesRouter.get("/:companyId/student/:studentId/fee-details", handleException(async (req, res) => {
        try {
            const {companyId, studentId} = req.params;
            const studentData = await StudentModel.findOne({deleted_at: null, company_id: companyId, _id: studentId})

            res.status(200).json(studentData.fees_info);
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

feesRouter.put("/:companyId/student/:studentId/fee-detail/:id", handleException(async (req, res) => {
    try {
        const feesId = req.params.id;
        const studentId = req.params.studentId;

        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(feesId)) {
            return res.status(400).json({ message: 'Invalid student ID or fees ID' });
        }

        const studentServ = new StudentService(req.body, req.user, req.query);
        const data = await studentServ.updateFeesDetails(studentId, feesId);

        if (!data) {
            return res.status(404).json({ message: "Guardian not found for the given student ID and entry ID" });
        }

        res.json({
            data: {
                message: "Student Guardian updated successfully.",
                student: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

feesRouter.put("/:companyId/student/:studentId/fee-payment/:invoiceId", handleException(async (req, res) => {
        try {
            const {companyId, studentId, invoiceId} = req.params;
            const studentData = await StudentModel.findOne({deleted_at: null, company_id: companyId, _id: studentId})
            const {fees_info} = studentData
            const {installments} = fees_info
            const {status} = req.body

            await StudentModel.findOneAndUpdate(
                {_id: studentId, 'fees_info.installments._id': invoiceId},
                {
                    $set: {
                        'fees_info.installments.$.status': req.body.status,
                        'fees_info.installments.$.payment_date': new Date()
                    }
                },
                {
                    new: true
                }
            );

            const singleInstallment = installments.find((e) => e.id === invoiceId)

            const amountPaid = status === "Paid" ? fees_info.amount_paid + singleInstallment.amount : fees_info.amount_paid;
            const amountRemaining = status === "Paid" ? fees_info.amount_remaining - singleInstallment.amount : fees_info.amount_remaining;
            console.log(amountPaid, amountRemaining)
            const feesData = {
                amount_paid: amountPaid,
                amount_remaining: amountRemaining,
                total_amount: fees_info.total_amount,
                no_of_installments: fees_info.no_of_installments,
                discount: fees_info.discount,
                admission_amount: fees_info.admission_amount,
                installments
            }

            res.status(200).json(feesData);
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

// feesRouter.delete("/:companyId/:id/deleteEvent",handleException(async (req, res) => {
//         try {
//             const eventServ = new EventService()
//             const data = await eventServ.deleteEvent(req.params.id)
//             res.status(200).json({data, message: "Event Deleted successfully."});
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     })
// );
//
// feesRouter.patch("/:companyId/:id/updateEvent",handleException(async (req, res) => {
//         try {
//             const eventId = req.params.id;
//             const reqBody = await UpdateEventRequest.validateAsync(req.body);
//             const eventServ = new EventService(reqBody, req.user, req.query);
//             const updatedEvent = await eventServ.updateEvent(eventId);
//
//             res.json({
//                 data: {
//                     message: "Event updated successfully.",
//                     updatedEvent,
//                 },
//             });
//         } catch (err) {
//             res.status(500).json({ error: err.message });
//         }
//     })
// );

module.exports = feesRouter