const BaseService = require("./index");
const ExpenseModel = require("../models/expense");
const {ResourceNotFoundError} = require("../errors/userErrors");

class ExpenseService extends BaseService{
    async addExpense() {

        const {type, desc, date, company_id, amount, createdBy} = this.reqBody;
        const expense = new ExpenseModel({
            type,
            desc, date, amount, createdBy,
            company_id,
        });

        await expense.save();
        return expense;
    }

    async getExpenses(companyId) {

        const page = parseInt(this.reqQuery.page) || 1;
        const limit = parseInt(this.reqQuery.limit) || 10;
        const startIndex = (page - 1) * limit;

        let query = { deleted_at: null, company_id: companyId };
        const searchKey = this.reqQuery.searchKey;

        if (searchKey) {
            query = {
                deleted_at: null,
                $or: [
                    { type: { $regex: new RegExp(searchKey, 'i') } },
                    { desc: { $regex: new RegExp(searchKey, 'i') } },
                    { createdBy: { $regex: new RegExp(searchKey, 'i') } },
                ],
            };
        }

        const expenses = await ExpenseModel.find(query)
            .skip(startIndex)
            .limit(limit);

        const total = await ExpenseModel.countDocuments(query);

        const data = {
            expenses,
            total,
            currentPage: page,
            per_page: limit,
            totalPages: Math.ceil(total / limit),
        };

        return data
    }

    async getExpense(id){
        const expenseId = id

        const expense = await ExpenseModel.findOne({
            _id: expenseId,
            deleted_at: null
        });

        if (!expense) {
            throw new ResourceNotFoundError("Expense not found.");
        }

        return expense
    }

    async updateExpense(expenseId) {

        const expense = await ExpenseModel.findByIdAndUpdate(expenseId, this.reqBody, { new: true });

        if (!expense) {
            throw new ResourceNotFoundError('Expense not found');
        }

        return expense
    }

    async deleteMultipleExpense() {
        const idsToDelete = this.reqBody.ids;
        const expenses = await ExpenseModel.updateMany(
            { _id: { $in: idsToDelete } },
            { $set: { deleted_at: new Date() } }
        );
        return expenses;
    }

}

module.exports = ExpenseService;