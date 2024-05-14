const express = require("express");
const Joi = require("joi");
const handleException = require("../decorators/error");
const InquiryService = require("../services/Inquiry");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");

const inquiryRouter = express.Router();

// const inquirySchema = Joi.object({
//     firstName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     occupation: Joi.string().optional(),
//     contact: Joi.string().required(),
//     email: Joi.string().email().required(),
//     education: Joi.string().optional(),
//     dob: Joi.string().isoDate().optional(),
//     address_line1: Joi.string().optional(),
//     address_line2: Joi.string().optional(),
//     city: Joi.string().optional(),
//     state: Joi.string().optional(),
//     country: Joi.string().optional(),
//     zip_code: Joi.string().optional(),
//     reference_by: Joi.string().optional(),
//     fatherName: Joi.string().optional(),
//     father_contact: Joi.string().optional(),
//     father_occupation: Joi.string().optional(),
//     interested_in: Joi.array().items(Joi.string()).optional(),
//     suggested_by: Joi.string().optional(),
// });

inquiryRouter.post("/:companyId/inquiry", handleException(async (req, res) => {
    try {
        // const reqBody = await inquirySchema.validateAsync(req.body);
        const companyId = req.params.companyId;
        const inquiryServ = new InquiryService(req.body, req.user);
        const data = await inquiryServ.createInquiry(companyId);

        res.json({
            success: true,
            data,
            message: 'Inquiry added successfully.'
        });
    } catch (err) {
        if (err instanceof BadRequestError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

inquiryRouter.get("/:companyId/inquiry", handleException(async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const inquiryServ = new InquiryService(req, res, req.query);
        const inquiryData = await inquiryServ.getInquirys(companyId);

        if (!inquiryData) {
            return res.status(404).json({ message: "No inquiries found." });
        }

        res.json({
            data: {
                message: "Inquiries retrieved successfully.",
                inquiry: inquiryData.inquiries,
                currentPage: inquiryData.currentPage,
                totalPages: inquiryData.totalPages,
                totalStudents: inquiryData.total,
                per_page: inquiryData.per_page,
            },
        });

    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));


inquiryRouter.get("/:companyId/:id/inquiry", handleException(async (req, res) => {
    try {
        const inquiryServ = new InquiryService(req, res, req.query);
        const data = await inquiryServ.getInquiry();

        res.json({
            data: {
                message: "Inquiry retrieved successfully.",
                inquiry: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

inquiryRouter.put("/:companyId/:id/updateInquiry", handleException(async (req, res) => {
    try {
        const inquiryServ = new InquiryService(req, res, req.query);
        const data = await inquiryServ.updateInquiry();

        res.json({
            data: {
                message: "Inquiry updated successfully.",
                student: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

inquiryRouter.delete("/:companyId/:id/deleteInquiry", handleException(async (req, res) => {
    try {
        const inquiryServ = new InquiryService(req, res, req.query);
        const data = await inquiryServ.deleteInquiry();

        res.json({
            data: {
                message: "Inquiry deleted successfully",
                student: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

inquiryRouter.delete("/:companyId/delete/all-inquiry", handleException(async (req, res) => {
    try {
        const inquiryServ = new InquiryService(req, res, req.query);
        const data = await inquiryServ.deletemultipalInquiry();

        res.json({
            data: {
                message: "Inquiry deleted successfully",
                student: data,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));


module.exports = inquiryRouter;