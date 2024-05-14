// const logger = require("../services/logger");

class BaseError extends Error {
    isPublic = false;

    constructor(message, isPublic = false, details) {
        super(message);

        details = details || {};

        Error.captureStackTrace(this, this.constructor);

        // logger.error({ isPublic, details }, message);

        this.message = message;
        this.isPublic = isPublic;
        this.status = details.status ?? 500;
        this.error_code = `${details?.error_code ?? this.status}`;

        if (process.env.NODE_ENV !== "production") {
            this.details = {
                ...details,
                trace: details instanceof Error ? details.stack : this.stack,
            };
        }
    }

    getResponse() {
        const errObj = {
            status: this.status,
            error_code: this.error_code,
            message: this.isPublic ? this.message : "Something went wrong!",
        };

        if (process.env.NODE_ENV !== "production") {
            errObj["details"] = this.details;
        }
        return errObj;
    }

    static getDefaultResponse() {
        return {
            status: 500,
            message: "Something went wrong!",
        };
    }
}

module.exports = BaseError;