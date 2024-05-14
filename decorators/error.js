const { JsonWebTokenError } = require("jsonwebtoken");
const Joi = require("joi");
const {
    BadRequestValidationError,
    FbRequestError,
    DisplayVideoError,
} = require("../errors/userErrors");
const AuthError = require("../errors/authErrors");

const handleException = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            next(new AuthError({ err }));
        } else if (err instanceof Joi.ValidationError) {
            next(new BadRequestValidationError(err));
        } else if (err.name === "FacebookRequestError") {
            next(new FbRequestError(err));
        } else if ((err.config?.url || "").indexOf("googleapis") >= 0) {
            next(new DisplayVideoError(err));
        } else {
            next(err);
        }
    }
};

module.exports = handleException;