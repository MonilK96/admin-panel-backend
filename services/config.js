const BaseService = require(".");
const ConfigModel = require("../models/config");
const {ResourceNotFoundError} = require("../errors/userErrors");

class ConfigService extends BaseService {
    async getConfigs(companyId) {
        const configs = await ConfigModel.find({
            company_id: companyId
        });

        return configs;

    }

    async updateConfig(companyId, configId) {
        const configData = await ConfigModel.findOne({
            company_id: companyId,
            _id: configId
        });

        if (!configData) {
            throw new ResourceNotFoundError(`Configuration data is not found.`)
        }

        const config = await ConfigModel.findByIdAndUpdate(configId, this.reqBody, {new: true});

        return config;
    }
}

module.exports = ConfigService;