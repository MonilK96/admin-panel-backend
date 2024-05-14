const BaseService = require(".");
const Demo = require("../models/demo");

class UpcomingDemoService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async getUpcomingDemo(companyId) {
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const currentDateTime = new Date(currentDate);
        currentDateTime.setHours(0, 0, 0, 0)
        const upcomingDemos = await Demo.find({
            'entries.date': { $gte: currentDateTime },
            company_id: companyId
        });

        const formattedData = upcomingDemos.map((demo) => {
            return demo.entries
                .filter((entry) => entry.date >= currentDateTime)
                .map((entry) => ({
                    _id: entry._id,
                    fullName: demo.fullName,
                    faculty_name: entry.faculty_name,
                    date: entry.date,
                    time: entry.time,
                }));
        }).flat();

        return formattedData;
    }
}

module.exports = UpcomingDemoService;
