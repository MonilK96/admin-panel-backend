// const { Roles } = require("../constants/model");
const { ServerError } = require("../errors/userErrors");

class BaseService {
    constructor(reqBody, reqUser, reqQuery) {
        this.reqBody = reqBody;
        this.reqUser = reqUser;
        this.reqQuery = reqQuery
    }

    is(role) {
        if (!this.reqUser || !this.reqUser.role) {
            throw new ServerError("Unexpected server error", {
                debug_message:
                    "Cannot check for role when user is not initialized properly",
            });
        }
        return this.reqUser.role;
    }

    isOnly(role) {
        return this.is(role) && this.reqUser.role.length === 1;
    }

    // Common checks
    canChangeState() {
        return this.is(Roles.Admin) || this.is(Roles.Developer);
    }

    // Ad checks
    canCreateAd() {
        return !this.isOnly(Roles.AccountManager);
    }

    canUpdateAd() {
        return true;
    }

    canApproveRejectAd() {
        return (
            this.is(Roles.Admin) ||
            this.is(Roles.Developer) ||
            this.is(Roles.AccountManager) ||
            this.is(Roles.Client)
        );
    }

    // Campaign checks
    canCreateCampaign() {
        return (
            this.is(Roles.Admin) ||
            this.is(Roles.Developer) ||
            this.is(Roles.AccountManager)
        );
    }

    canUpdateCampaignBrief() {
        return (
            this.is(Roles.Admin) ||
            this.is(Roles.Developer) ||
            this.is(Roles.AccountManager) ||
            this.is(Roles.Client)
        );
    }

    canApproveRejectCampaign() {
        return (
            this.is(Roles.Admin) ||
            this.is(Roles.Developer) ||
            this.is(Roles.AccountManager) ||
            this.is(Roles.Client)
        );
    }

    // User check
    canUpdateUserRole() {
        return this.is(Roles.Admin) || this.is(Roles.Developer);
    }
}

module.exports = BaseService;