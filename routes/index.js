const studentRouter = require("../controllers/student");
const dashboardRouter = require("../controllers/dashboard");
const empRouter = require("../controllers/employee");
const userRouter = require("../controllers/user");
const commonRouter = require("../controllers/common");
const inquiryRouter = require("../controllers/inquiry")
const demoRouter = require("../controllers/demo")
const upcomingDemoRouter = require("../controllers/upcomingdemo")
const taskRouter = require("../controllers/task")
const batchRouter = require("../controllers/batch")
const eventRouter = require("../controllers/event");
const seminarRouter = require("../controllers/seminar");
const accountRouter = require("../controllers/account");
const protect = require("../middlewares/protect");
const feesRouter = require("../controllers/fees");
const attendanceRouter = require("../controllers/attendance");
const expenseRouter = require("../controllers/expense");
const configRouter = require("../controllers/config");
const superAdminRouter = require("../controllers/super-admin");
const appRouter = require("express").Router();

appRouter.use('/api', superAdminRouter);
appRouter.use('/api', commonRouter);
appRouter.use('/api/users', protect, userRouter);
appRouter.use('/api/company', studentRouter);
appRouter.use('/api/company', dashboardRouter);
appRouter.use('/api/company', empRouter);
appRouter.use('/api/company', inquiryRouter);
appRouter.use('/api/company', demoRouter);
appRouter.use('/api/company', upcomingDemoRouter);
appRouter.use('/api/company', taskRouter);
appRouter.use('/api/company', batchRouter);
appRouter.use('/api/company', eventRouter);
appRouter.use('/api/company', seminarRouter);
appRouter.use('/api/company', feesRouter);
appRouter.use('/api/company', attendanceRouter);
appRouter.use('/api/company', expenseRouter);
appRouter.use('/api/company', accountRouter);
appRouter.use('/api/company', configRouter);

module.exports = appRouter;