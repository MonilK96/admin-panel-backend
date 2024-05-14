const handleException = require("../decorators/error");
const UpcomingDemoService = require("../services/upcomingdemo");
const upcomingDemoRouter = require("express").Router();

upcomingDemoRouter.get("/:companyId/upcomingdemo", handleException(async (req, res) => {
    try {
        const demoServ = new UpcomingDemoService(req, res, req.query);
        const companyId = req.params.companyId;
        const data = await demoServ.getUpcomingDemo(companyId);

        res.json({
            success: true,
            upcomingDemos: data,
            message: 'UpcomingDemo retrieved successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));

module.exports = upcomingDemoRouter;