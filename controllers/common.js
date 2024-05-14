const handleException = require("../decorators/error");
const Joi = require("joi");
const CommonService = require("../services/common");
const path = require("path");
const multer = require("multer");
const {uploadFile} = require("../helpers/avatar");
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const CompanyModel = require('../models/company')
const ConfigModel = require('../models/config')
const BaseError = require("../errors");
const EmployeeService = require("../services/employee");
const {BadRequestError} = require("../errors/userErrors");
const {InvalidCredentialsError} = require("../errors/userErrors");
const UserModel= require("../models/User");
const {createHash} = require("../common/hash");

const commonRouter = require('express').Router()

const LoginRequest = Joi.object({
    email: Joi.string().email().optional(),
    contact: Joi.string().optional(),
    password: Joi.string().required(),
});

const RegisterRequest = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    contact: Joi.string().required(),
    company_name: Joi.string().required(),
    role: Joi.string().required(),
    password: Joi.string().required()
})


commonRouter.post(
    "/login",
    handleException(async (req, res) => {
        try {
            const reqBody = await LoginRequest.validateAsync(req.body);
            const commonServ = new CommonService(reqBody, req.user, req.query);
            const tokens = await commonServ.login();

            res.json({
                data: {
                    message: "Logged in successfully.",
                    tokens,
                },
            });
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({error: "Internal server error"});
            }
        }
    })
);

commonRouter.post(
    "/register",
    handleException(async (req, res) => {
        try {
            const reqBody = await RegisterRequest.validateAsync(req.body);
            const commonServ = new CommonService(reqBody, req.user, req.query);
            const tokens = await commonServ.register();

            res.json({
                data: {
                    message: "New company successfully registered.",
                    tokens,
                },
            });
        } catch (err) {
            if (err instanceof BadRequestError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({error: "Internal server error"});
            }
        }
    })
);

commonRouter.post(
    "/company/:companyId/invite-user",
    handleException(async (req, res) => {
        try {
            const companyId = req.params.companyId
            const empServ = new EmployeeService(req.body, req.user, req.query);
            const tokens = await empServ.createEmployee(companyId);

            res.json({
                data: {
                    message: "New User successfully registered.",
                    tokens,
                },
            });
        } catch (err) {
            if (err instanceof BadRequestError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({error: "Internal server error"});
            }
        }
    })
);


commonRouter.put(
    "/company/:id/company-logo",
    upload.single("logo_url"),
    handleException(async (req, res) => {
        const companyId = req.params.id;
        const file = req.file;
        const logoUrl = await uploadFile(file.buffer);

        // Update company logo
        const companyData = await CompanyModel.findById(companyId);
        if (!companyData) {
            return res.status(404).json({status: 404, message: "Company not found"});
        }
        companyData.logo_url = logoUrl;
        await companyData.save();

        // Update company details in config
        const configs = await ConfigModel.findOne({company_id: companyId});
        if (!configs) {
            return res.status(404).json({status: 404, message: "Config not found for company"});
        }

        configs.company_details = {...configs.company_details, logo: logoUrl};
        await configs.save();

        res.json({
            data: {
                message: "Company logo updated successfully.",
                company: companyData
            },
        });
    })
);


commonRouter.post(
    "/logout",
    handleException(async (req, res) => {
        try {
            const commonServ = new CommonService(req.body, req.user);
            await commonServ.logout();
            res.json({
                data: {
                    message: "Logged out successfully.",
                },
            });
        } catch (err) {
            if (err instanceof BaseError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({error: "Internal server error"});
            }
        }
    })
);

commonRouter.post(
    "/refresh-token",
    handleException(async (req, res) => {
        const refreshToken = req.headers["auth_jwt_refresh"];

        const commonServ = new CommonService({
            refreshToken,
        });

        const tokens = await commonServ.refreshToken(req);

        res.json({
            data: {
                message: "Token refreshed",
                tokens,
            },
        });
    })
);

commonRouter.get('/company/:id', async (req, res) => {
    const companyId = req.params.id
    const data = await CompanyModel.findById(companyId)
    res.json(data);
});

commonRouter.get('/company/:id/update-password', async (req, res) => {
    const companyId = req.params.id
    const users = await UserModel.find({company_id: companyId}).select("contact")

    const sanitizedContacts = users.map(contactObj => {
        let sanitizedContact = contactObj.contact.replace(/[^\d]/g, ''); // Remove all non-digit characters
        if (sanitizedContact.startsWith('91') && sanitizedContact.length === 12) {
            sanitizedContact = sanitizedContact.substring(2); // Remove country code '91'
        }
        return { _id: contactObj._id, contact: sanitizedContact }; // Include _id for updating
    });

    for (const { _id, contact } of sanitizedContacts) {
        const encryptedPassword = await createHash(contact);
        await UserModel.findByIdAndUpdate(_id, { password: encryptedPassword });
    }

    res.json(sanitizedContacts);
});

commonRouter.get('/send-notification', async (req, res) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        const notification = await client.messages.create({
            from: '+16592157593',
            body: 'Hello there, this is a Twilio WhatsApp message!',
            to: 'whatsapp:+919313582375'
        });

        res.json({
            data: {
                message: "Notification sent successfully",
                notification,
            },
        });
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
});


module.exports = commonRouter