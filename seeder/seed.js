const ConfigModel = require('../models/config')
const CompanyModel = require("../models/company")

const companyConfigs = async (companyId) => {

    const companyDetails = await CompanyModel.findOne(companyId)

    const configs = new ConfigModel({
        company_id: companyId,
        expenses: ["Rent", "Electricity Bill", "Salary", "Stationary", "Maintenance", "New Asset Purchase", "Office Expense"],
        roles: ["Admin", "Student", "Employee"],
        courses: ["Adobe XD", "Adobe Illustrator", "Master In Flutter Development", "Master In Android Development", "Master In Game Development", "Master In Full Stack Development", "Master In Web Development", "Node js", "React js", "Python", "Angular JS", "C Programming", "C++ Programming", "Java Programming", "IOS", "Advance PHP", "Laravel", "Wordpress", "Master In Web Design", "Master in UI/UX Design", "Advance Graphics Design", "Photoshop", "CCC- Basic Computer Course"],
        classrooms: ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5"],
        emp_type: ["Faculty", "HR", "CEO", "Developer", "General Manager", "Department Head", "Assistant Manager"],
        developer_type: [
            "Flutter developer",
            "Android developer",
            "ReactJS developer",
            "NodeJS developer",
            "Full stack developer",
            "UI / UX",
            "Graphic designer",
            "Game developer",
        ],
        company_details: {name: companyDetails.company_name, logo: companyDetails.logo_url}
    });

    await configs.save();
}

module.exports = {companyConfigs}