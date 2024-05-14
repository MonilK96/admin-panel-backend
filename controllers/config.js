const handleException = require("../decorators/error");
const ConfigService = require("../services/config");
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");
const configRouter = require("express").Router();

configRouter.get("/:companyId/configs", handleException(async (req, res) => {
    try {
        const companyId = req.params.companyId
        const configServ = new ConfigService(req.body, req.user, req.query)
        const configs = await configServ.getConfigs(companyId)

        res.json({
            data: {
                message: "Configs retrieved successfully.",
                data: configs,
            },
        });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

configRouter.put("/:companyId/configs/:id", handleException(async (req, res) => {
    try {
        const companyId = req.params.companyId
        const configId = req.params.id
        const configServ = new ConfigService(req.body, req.user, req.query)
        const config = await configServ.updateConfig(companyId, configId)

        res.json({
            data: {
                message: "Configs updated successfully.",
                data: config,
            },
        });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

module.exports = configRouter;