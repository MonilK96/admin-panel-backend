const handleException = require("../decorators/error");
const superAdminRouter = require("express").Router();
const UserModel = require("../models/User")
const StudentModel = require("../models/student")
const EmployeeModel = require("../models/employee")
const CompanyModel = require("../models/company")

superAdminRouter.get("/company-dashboard", handleException(async (req, res) => {
    try {
        const data = await CompanyModel.find({deleted_at: null}).select("_id company_name logo_url");

        res.json({
            data: {
                message: "Dashboard data retrieved successfully.",
                companies: data
            },
        });
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}));

superAdminRouter.patch("/company-dashboard/:companyId", handleException(async (req, res) => {
    try {
        const companyId = req.params.companyId;
        let users
        if (req.body.type === "enable") {
            const deletedStudentIds = await StudentModel.find({ company_id: companyId, deleted_at: { $ne: null } }).select("student_user_id");
            const deletedEmployeeIds = await EmployeeModel.find({ company_id: companyId, deleted_at: { $ne: null } }).select("emp_user_id");
            const deletedUserIds = [...deletedEmployeeIds.map(item => item.emp_user_id), ...deletedStudentIds.map(item => item.student_user_id)];
            const activeUsers = await UserModel.find({ _id: { $nin: deletedUserIds } });
            users = await UserModel.updateMany({ $and: [{ company_id: companyId }, { _id: { $nin: deletedUserIds } }] }, { deleted_at: null });

        } else {
            await UserModel.updateMany({ company_id: companyId }, { deleted_at: Date.now() });
        }

        res.json({
            data: {
                message: "Dashboard data retrieved successfully.",
                users
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));



module.exports = superAdminRouter;