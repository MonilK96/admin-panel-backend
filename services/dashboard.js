const BaseService = require(".");
const User = require("../models/User");
const Inquiry = require("../models/inquiry");
const Student = require("../models/student")
const Employee = require("../models/employee")

class GetdashboardService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async getdashboardData(companyId) {
        const [studentCount, employeeCount, inquiries] = await Promise.all([
            Student.countDocuments({company_id: companyId, deleted_at: null}),
            Employee.countDocuments({company_id: companyId, deleted_at: null}),
            Inquiry.countDocuments({company_id: companyId, deleted_at: null})
        ]);
        return {studentCount, employeeCount, inquiries};
    }
}

module.exports = GetdashboardService;