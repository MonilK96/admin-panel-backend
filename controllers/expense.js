const handleException = require("../decorators/error");
const ExpenseService = require("../services/expense");
const {BadRequestError} = require("../errors/userErrors");
const {ResourceNotFoundError} = require("../errors/userErrors");
const expenseRouter = require("express").Router()


expenseRouter.post(
    "/expense",
    handleException(async (req, res) => {
        try {
            const expenseServ = new ExpenseService(req.body, req.user, req.query);
            const expense = await expenseServ.addExpense();

            res.json({
                data: {
                    message: "Expense request created successfully.",
                    data: expense,
                },
            });
        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

expenseRouter.get(
    "/:companyId/expense",
    handleException(async (req, res) => {
        try {
            const companyId = req.params.companyId;
            const expenseServ = new ExpenseService(req.body, req.user, req.query);
            const data = await expenseServ.getExpenses(companyId);

            res.status(200).json({ success: true, data, message: 'Expenses retrieved successfully.' });

        } catch (error) {

            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: 'Validation Error', details: error.errors });
            }

            res.status(500).json({ success: false, message: 'Internal Server Error', details: error.message });
        }
    })
);

expenseRouter.get("/:companyId/:id/expense", handleException(async (req, res) => {
        try {
            const expenseServ = new ExpenseService(req.body, req.user, req.query);
            const id = req.params.id;
            const data = await expenseServ.getExpense(id);

            res.status(200).json({ data, message: 'Expense retrieved successfully.' });

        } catch (err) {
            if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
                res.status(err.status).json({status: err.status, message: err.message});
            } else {
                return res.status(500).json({message: "Internal server error"});
            }
        }
    })
);

expenseRouter.put("/:companyId/:id/update-expense", handleException(async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expenseServ = new ExpenseService(req.body, req.user);
        const data = await expenseServ.updateExpense(expenseId);

        res.status(200).json({ data, message: 'Expense updated successfully.' });

    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

expenseRouter.delete("/:companyId/delete/all-expense", handleException(async (req, res) => {
    try {
        const expenseServ  = new ExpenseService(req.body, req.user, req.query);
        const data = await expenseServ.deleteMultipleExpense();

        res.json({
            data: {
                message: "Expense deleted successfully",
                expenses: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));





module.exports = expenseRouter;