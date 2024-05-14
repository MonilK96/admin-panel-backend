const User = require("../models/User")
const Joi = require('joi')
const handleException = require("../decorators/error");
const userRouter = require('express').Router()
const UserService = require('../services/user')
const multer = require("multer");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");
// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {uploadFile} = require("../helpers/avatar");

const CreateUserRequest = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    contact: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    avatar_url: Joi.string().optional(),
    company_name: Joi.string().required()
});

const UpdateUserRequest = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    contact: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    role: Joi.string().optional(),
    avatar_url: Joi.string().optional(),
    company_name: Joi.string().optional()
});

userRouter.post(
    "/",
    handleException(async (req, res) => {
        try {
            const reqBody = await CreateUserRequest.validateAsync(req.body);
            const userServ = new UserService(reqBody, req.user);
            const userId = await userServ.createUser();

            res.json({
                data: {
                    message: "User created successfully.",
                    id: userId,
                },
            });
        } catch (err) {
            if (err instanceof BadRequestError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({status: 500, message: "Internal server error"});
            }
        }
    })
);

userRouter.get(
    "/",
    handleException(async (req, res) => {
        try {
            const userServ = new UserService(req.body, req.user)
            const data = await userServ.getAllUsers()
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    })
);

userRouter.get("/company/:companyId/role/:role", handleException(async (req, res) => {
    const { companyId, role } = req.params;
    try {
        const data = await new UserService(req, res, req.query).getRoleWiseUsers(companyId, role);
        res.status(200).json({ data, message: `${role} retrieved successfully.` });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({status: 500, message: "Internal server error"});
        }
    }
}));

userRouter.get(
    "/me",
    handleException(async (req, res) => {
        const userServ = new UserService(req.body, req.user);
        const user = await userServ.getUser(req.user._id);

        const data = await userServ._getUserData(user)

        res.status(200).json(data);
    })
);

userRouter.get(
    "/:id",
    handleException(async (req, res) => {
        try {
            const userId = req.params.id;

            const userServ = new UserService(req.body, req.user)
            const data = await userServ.getUser(userId)

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    })
);

userRouter.put(
    "/:id",
    handleException(async (req, res) => {
        try {
            const userId = req.params.id;
            const reqBody = await UpdateUserRequest.validateAsync(req.body);
            const userServ = new UserService(reqBody, req.user)

            const data = await userServ.updateUser(userId)

            res.status(200).json(data);
        } catch (err) {
            if (err instanceof ResourceNotFoundError) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({status: 500, message: "Internal server error"});
            }
        }
    })
);

userRouter.put(
    "/:id/profile-pic",
    upload.single("profile-pic"),
    handleException(async (req, res) => {
        const userId = req.params.id;
        const file = req.file;
        const imageUrl = await uploadFile(file.buffer);
        await User.findByIdAndUpdate(userId, {avatar_url: imageUrl}, {new: true});

        res.json({
            data: {
                message: "Profile pic uploaded successfully",
            },
        });
    })
);

userRouter.delete(
    "/:id",
    handleException(async (req, res) => {
        try {
            const userId = req.params.id;

            const deletedUser = await User.findByIdAndUpdate(userId, {deleted_at: new Date()}, {new: true});

            res.status(200).json(deletedUser);
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    })
);

module.exports = userRouter;