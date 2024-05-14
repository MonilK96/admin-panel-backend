const BaseService = require(".");
const UserModel = require('../models/User')
const {verifyHash} = require("../common/hash");
const {sign} = require("jsonwebtoken");

class AuthService extends BaseService {
    async login() {
        let isUserExist;

        if(this.reqBody.email){
            isUserExist = await UserModel.findOne({ email: this.reqBody.email, deleted_at: null })
        }else{
            isUserExist = await UserModel.findOne({ contact: this.reqBody.contact, deleted_at: null })
        }

        if (!isUserExist) {
            throw new Error('User not found.');
        }

        const isMatch = await verifyHash(this.reqBody.password, isUserExist.password)

        if (!isMatch) {
            throw new Error("Password you had enter was incorrect.")
        }

        const token = await this.generateAccessToken(isUserExist._id)

        const {_id, role, firstName, lastName, contact, email} = isUserExist

        const payload = {_id, role, firstName, lastName, contact, email, token}

        return payload
    }

    async generateAccessToken(userId){
        const user = await UserModel.findById(userId)
        const {_id, email, contact, role} = user
        const payload = {_id, email, contact, role}
        const token = sign(payload, process.env["JWT_SECRET"], {expiresIn: '1h'})
        return token
    }

}

module.exports = AuthService