const BaseError = require(".");

class AuthError extends BaseError {
    constructor(details) {
        super("Not authorised", true, {
            status: 401,
            ...(details || {}),
        });
    }
}

module.exports = AuthError;