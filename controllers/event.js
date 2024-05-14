const Joi = require("joi");
const handleException = require("../decorators/error");
const EventService = require("../services/event");
const eventRouter = require("express").Router()
const EventModel = require("../models/event")
const UserModel = require("../models/User")
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");

const CreateEventRequest = Joi.object({
    event: Joi.string(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    event_user_id: Joi.string().required(),
    leave_type: Joi.string().required(),
    leave_description: Joi.string(),
    leave_status: Joi.string(),
});

const UpdateEventRequest = Joi.object({
    event: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    event_user_id: Joi.string(),
    leave_type: Joi.string(),
    leave_description: Joi.string(),
    leave_status: Joi.string(),
    denied_reason:Joi.string()
});

eventRouter.post("/:companyId/event",handleException(async (req, res) => {
        try {
            const reqBody = await CreateEventRequest.validateAsync(req.body);
            const eventServ = new EventService(reqBody, req.user, req.query);
            const companyId = req.params.companyId;
            const eventId = await eventServ.addEvent(companyId);

            res.json({
                data: {
                    message: "Event added successfully.",
                    id: eventId,
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

eventRouter.get("/:companyId/event",handleException(async (req, res) => {
        try {
            const companyId = req.params.companyId;

            const events = await EventModel.find({deleted_at: null, company_id: companyId});
            const userIds = events.map((event) => event.event_user_id);
            const users = await UserModel.find({_id: {$in: userIds}});


            const data = events.map(event => {
                const user = users.find(user => user._id.toString() === event.event_user_id.toString());
                return {
                    ...event.toObject(),
                    firstName: user ? user.firstName : '',
                    lastName: user ? user.lastName : '',
                };
            });
            res.status(200).json(data);
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

eventRouter.delete("/:companyId/:id/deleteEvent",handleException(async (req, res) => {
        try {
            const eventServ = new EventService()
            const data = await eventServ.deleteEvent(req.params.id)
            res.status(200).json({data, message: "Event Deleted successfully."});
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
); 

eventRouter.patch("/:companyId/:id/updateEvent",handleException(async (req, res) => {
        try {
            const eventId = req.params.id;
            const reqBody = await UpdateEventRequest.validateAsync(req.body);
            const eventServ = new EventService(reqBody, req.user, req.query);
            const updatedEvent = await eventServ.updateEvent(eventId);

            res.json({
                data: {
                    message: "Event updated successfully.",
                    updatedEvent,
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

module.exports = eventRouter