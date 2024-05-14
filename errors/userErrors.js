const BaseError = require(".");

class InvalidCredentialsError extends BaseError {
    constructor(detail = {}) {
        super("Invalid credentials", true, {
            status: 401,
            ...detail,
        });
    }
}

class BadRequestError extends BaseError {
    constructor(message, detail = {}) {
        super(`Invalid request: ${message}`, true, {
            status: 400,
            ...detail,
        });
    }
}

class BadRequestValidationError extends BadRequestError {
    // To be used only for joi validation error wrapping
    constructor(err) {
        // Ref: https://joi.dev/api/?v=17.4.0#validationerror
        const validationMessage = err.details.map((el) => el.message).join(". ");
        super(validationMessage, {
            err,
        });
    }
}

class ResourceNotFoundError extends BaseError {
    constructor(resourceName, detail = {}) {
        super(`${resourceName} not found`, true, {
            status: 404,
            ...detail,
        });
    }
}

class ServerError extends BaseError {
    constructor(message, detail = {}) {
        super(message, true, {
            status: 500,
            ...detail,
        });
    }
}

class AccessDeniedError extends BaseError {
    constructor(detail = {}) {
        super("Access denied", true, {
            status: 403,
            ...detail,
        });
    }
}

class FbRequestError extends BaseError {
    constructor(err) {
        super(
            err.message || err.response.error?.message || "Something went wrong!",
            true,
            {
                err,
            }
        );
    }
}

class DisplayVideoError extends BaseError {
    constructor(err) {
        super(
            err.response.data?.error?.message ||
            err.response.data?.error_description ||
            "Something went wrong!",
            true,
            {
                err,
            }
        );
    }
}

module.exports.InvalidCredentialsError = InvalidCredentialsError;
module.exports.BadRequestError = BadRequestError;
module.exports.BadRequestValidationError = BadRequestValidationError;
module.exports.ResourceNotFoundError = ResourceNotFoundError;
module.exports.ServerError = ServerError;
module.exports.AccessDeniedError = AccessDeniedError;
module.exports.FbRequestError = FbRequestError;
module.exports.DisplayVideoError = DisplayVideoError;