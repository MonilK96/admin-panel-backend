const BaseService = require(".")
const {signRefreshToken, signLoginToken, verifyRefreshToken} = require("../common/jwt");
const UserModel = require("../models/User");
const CompanyModel = require("../models/company")
const EmployeeModel = require("../models/employee")
const {BadRequestError} = require("../errors/userErrors");
const {InvalidCredentialsError} = require("../errors/userErrors");
const {companyConfigs} = require("../seeder/seed");
const {verifyHash, createHash} = require("../common/hash");

class CommonService extends BaseService {

    _getTokens(userId) {
        const signedToken = signLoginToken(userId);
        const refreshToken = signRefreshToken(userId);
        return {
            jwt: signedToken,
            jwtRefresh: refreshToken,
        };
    }

    async _setTokens(userId) {
        const tokens = this._getTokens(userId);

        await UserModel.findByIdAndUpdate(userId, {other_info: tokens}, {new: true})

        return this._getTokens(userId);
    }

    async login() {

        let user;

        if (this.reqBody.email) {
            user = await UserModel.findOne({email: this.reqBody.email, deleted_at: null})
        } else {
            user = await UserModel.findOne({contact: this.reqBody.contact, deleted_at: null})
        }

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isMatch = await verifyHash(this.reqBody.password, user.password)

        if (!isMatch) {
            throw new InvalidCredentialsError();
        }

        return this._setTokens(user.id)
    }

    async inviteUser() {
        const {firstName, lastName, contact, email, password, company_name, role, company_id} = this.reqBody

        let user;

        if (this.reqBody.email) {
            user = await UserModel.findOne({email: this.reqBody.email, deleted_at: null})
        } else {
            user = await UserModel.findOne({contact: this.reqBody.contact, deleted_at: null})
        }

        if (user) {
            throw new BadRequestError("User already exist");
        }

        const encryptedPassword = await createHash(password);

        user = new UserModel({
            firstName,
            lastName,
            email,
            contact,
            role,
            password: encryptedPassword,
            company_id: company_id,
        });

        await user.save()

        const emp = new EmployeeModel({

        })
        return this._setTokens(user.id)
    }

    async register() {
        const {firstName, lastName, contact, email, password, company_name, role} = this.reqBody
        let user;
        let company;

        const isAdminExist = await UserModel.exists({
            deleted_at: null,
            $or: [{"contact": contact}, {"email": email}],
        });

        if (isAdminExist) {
            throw new BadRequestError("Company admin with this information already exists.");
        }

        const companyNameExist = await CompanyModel.exists({
            deleted_at: null,
            $or: [{"company_name": company_name}]
        })

        if (companyNameExist) {
            throw new BadRequestError("Company admin with this information already exists.");
        }

        const encryptedPassword = await createHash(password);

        company = new CompanyModel({
            company_name
        })

        await company.save()

        user = new UserModel({
            firstName,
            lastName,
            email,
            contact,
            role,
            password: encryptedPassword,
            company_id: company._id,
        });

        await user.save()

        await companyConfigs(company._id)

        return this._setTokens(user.id)
    }

    async logout() {
        await UserModel.findByIdAndUpdate(this.reqBody.id, {other_info: {}}, {new: true})
    }

    async refreshToken(req) {
        const decoded = await verifyRefreshToken(this.reqBody.refreshToken);

        return this._setTokens(decoded.id);
    }
}

module.exports = CommonService