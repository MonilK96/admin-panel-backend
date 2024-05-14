const _ = require("lodash");
const { TokenExpiredError } = require("jsonwebtoken");
const appJwt = require("../common/jwt");
const { ERROR_CODE } = require("../constants/response");
const handleException = require("../decorators/error");
const { ResourceNotFoundError } = require("../errors/userErrors");
const AuthError = require("../errors/authErrors");
const UserService = require("../services/user");

const protect = handleException(async function authenticate(req, res, next) {
    const authHeaders = _.pick(req.headers, ["auth_jwt", "auth_jwt_refresh"]);
    if (
        !authHeaders ||
        !authHeaders["auth_jwt"] ||
        authHeaders["auth_jwt"].length === 0 ||
        !authHeaders["auth_jwt_refresh"] ||
        authHeaders["auth_jwt_refresh"].length === 0
    ) {
        const details = {
            debug_message: "JWT token/ refresh token cookie not found",
        };
        if (authHeaders["auth_jwt_refresh"]) {
            details["error_code"] = ERROR_CODE.AUTH_EXPIRED;
        }
        throw new AuthError(details);
    }

    try {
        const decoded = await appJwt.verifyToken(authHeaders["auth_jwt"]);
        const userServ = new UserService()
        const user = await userServ.getUser(decoded.id)
        if (
            !user?.other_info ||
            !user?.other_info["jwt"] ||
            user?.other_info["jwt"] !== authHeaders["auth_jwt"]
        ) {
            throw new AuthError({
                debug_message: "The auth token provided is invalid",
            });
        }
        req.user = user;
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            throw new AuthError({
                debug_message: "The requested user is not found OR is not active",
            });
        }
        if (err instanceof TokenExpiredError) {
            throw new AuthError({
                debug_message: "Auth token expired, refresh your token",
                error_code: ERROR_CODE.AUTH_EXPIRED,
            });
        }
        throw err;
    }

    next();
});

module.exports = protect;
