const Joi = require('joi');
const handleException = require('../decorators/error');
const SeminarService = require('../services/seminar');
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");
const seminarRouter = require('express').Router();

const CreateseminarRequest = Joi.object({
    title: Joi.string().required(),
    date_time: Joi.date().required(),
    schedule_by: Joi.string().required(),
    attended_role: Joi.string().required(),
    attended_by: Joi.array().items(
        Joi.object({
            attended_id: Joi.string().required(),
        })
    ),
});

seminarRouter.post("/:companyId/seminar", handleException(async (req, res) => {
    try {
        const reqBody = await CreateseminarRequest.validateAsync(req.body);
        const companyId = req.params.companyId;
        const seminarServ = new SeminarService(reqBody, req.user);
        const result = await seminarServ.createSeminar(companyId);

        res.json({
            data: {
                message: "Seminar created successfully.",
                seminar: result,
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

seminarRouter.get("/:companyId/:attendedId/seminar", handleException(async (req, res) => {
    const { companyId, attendedId } = req.params;

    try {
        const seminarServ = new SeminarService(req, res, req.query);
        const tasksData = await seminarServ.getUserWiseSeminar(companyId, attendedId);

        res.json({
            data: {
                message: "seminar retrieved successfully.",
                seminars: tasksData.seminars,
                totalData: tasksData.totalData,
                totalPages: tasksData.totalPages,
                currentPage: tasksData.currentPage,
                pageSize: tasksData.pageSize,
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

seminarRouter.get("/:companyId/:seminarId/:attendedId/seminar", handleException(async (req, res) => {
    const { companyId, seminarId, attendedId } = req.params;

    try {
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.getSeminar(companyId, seminarId, attendedId);

        res.json({
            data: {
                message: "seminar retrieved successfully.",
                seminars: data.seminars,
                totalData: data.totalData,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
                pageSize: data.pageSize,
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

seminarRouter.put("/:companyId/:seminarId/updateseminar", handleException(async (req, res) => {
    try {
        const seminarId = req.params.seminarId;
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.updateSeminar(seminarId);

        res.json({ message: "Seminar updated successfully.", data });
    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

seminarRouter.delete("/:companyId/:seminarId/deleteseminar", handleException(async (req, res) => {
    try {
        const seminarId = req.params.seminarId;
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.deleteSeminar(seminarId);

        res.json({ message: "Seminar deleted successfully.", data });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

seminarRouter.delete("/:companyId/:seminarId/:attendedId/deleteseminar", handleException(async (req, res) => {
    try {
        const { seminarId, attendedId } = req.params;
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.deleteSeminarAttended(seminarId, attendedId);

        res.json({ message: "Seminar attended deleted successfully.", data });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

seminarRouter.get("/:companyId/seminarOverView", handleException(async (req, res) => {
    const companyId = req.params.companyId;

    try {
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.seminarOverView(companyId);

        res.json({ message: "Seminar overView retrieved successfully.", data });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

seminarRouter.delete("/:companyId/delete/multipleSeminar", handleException(async (req, res) => {
    try {
        const seminarServ = new SeminarService(req, res, req.query);
        const data = await seminarServ.deletemultipleSeminar();

        res.json({ message: "Multiple seminar deleted successfully", data });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

module.exports = seminarRouter;