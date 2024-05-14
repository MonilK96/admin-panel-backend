const handleException = require("../decorators/error");
const AccountService = require("../services/account");
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");
const accountRouter = require("express").Router()

accountRouter.get(
    "/:companyId/account",
    handleException(async (req, res) => {
        try {
            const companyId = req.params.companyId
            const accountServ = new AccountService(req.body, req.user, req.query);
            const accountDetails = await accountServ.getAccountDetails(companyId);

            res.json({
                data: {
                    message: "Account details retrieved successfully.",
                    data: accountDetails,
                },
            });
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

module.exports = accountRouter