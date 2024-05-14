const BaseService = require(".");
const {createHash} = require("../common/hash");
const UserModel = require('../models/User')
const User = require("../models/User");
const CompanyModel = require("../models/company")
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");

class UserService extends BaseService{
    async createUser() {

        const company = new CompanyModel({company_name: this.reqBody.company_name})

        const companyData  = await company.save()

        const isUserExist = await UserModel.exists({
            deleted_at: null,
            $or: [{"contact": this.reqBody.contact}, {"email": this.reqBody.email}, {"company_id": companyData._id}],
        });

        if(isUserExist){
            throw BadRequestError("User Already Exist...!")
        }

        const encryptedPassword = await createHash(this.reqBody.password);

        const dbUser =  new UserModel({...this.reqBody, password: encryptedPassword, company_id: companyData._id})

        const user = await dbUser.save();

        return user.id;
    }

    async getAllUsers(){

        const users = await UserModel.find({deleted_at: null});

        return users.map((e)=> this._getUserData(e))
    }

    async getRoleWiseUsers(companyId, role) {
        try {
            const users = await UserModel.find({ company_id: companyId, role: role, deleted_at: null });
            return users.map(user => {
                return {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            });
        } catch (error) {
            throw new ResourceNotFoundError(`Error fetching ${role} users for company ${companyId}: ${error.message}`);
        }
    }

    async getUser(userId){
        const actualUserId = userId === "me" ? this.reqUser._id : userId;

        const user = await User.findOne({ _id: actualUserId, deleted_at: null })

        return user
    }
    async updateUser(userId){
        const user = await User.findOne({ _id: userId, deleted_at: null })

        if(!user){
            throw new ResourceNotFoundError("User not found")
        }

        const updatedUser = await User.findByIdAndUpdate(userId, this.reqBody, { new: true })

        return this._getUserData(updatedUser)
    }

    _getUserData(user){
        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            contact: user.contact,
            role: user.role,
            other_info: user.other_info,
            avatar_url : user.avatar_url,
            company_id: user.company_id
        }
    }

}

module.exports = UserService;