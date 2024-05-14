const BaseService = require("./index");
const ExpenseModel = require("../models/expense");
const StudentModel = require("../models/student");
const e = require("express");

class AccountService extends BaseService {
    async getAccountDetails(companyId) {
        const query = {
            deleted_at: null,
            company_id: companyId
        };

        if (this.reqQuery.startDate && this.reqQuery.endDate) {
            const startDate = new Date(`${this.reqQuery.startDate}T00:00:00.000Z`);
            const endDate = new Date(`${this.reqQuery.endDate}T23:59:59.999Z`);
            query.date = {$gte: startDate, $lte: endDate};
        }

        const getExpenses = ExpenseModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    created_at: {
                        $gte: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                        $lte: new Date(`${this.reqQuery.endDate}T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $group: {
                    _id: null,
                    expensesByType: { $push: { type: "$_id", totalAmount: "$totalAmount" } },
                    totalExpense: { $sum: "$totalAmount" }
                }
            }
        ]);

        const studentQuery = {
            'personal_info.joining_date': {
                $gte: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                $lt: new Date(`${this.reqQuery.endDate}T23:59:59.999Z`)
            },
            deleted_at: null,
            company_id: companyId
        };

        const getExistingAdmissions = StudentModel.countDocuments({
            'personal_info.joining_date': {
                $lt: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`)
            },
            deleted_at: null,
            company_id: companyId
        });

        const getFeesInfo = StudentModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.payment_date': {
                        $gte: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                        $lte: new Date(`${this.reqQuery.endDate}T23:59:59.999Z`)
                    }
                }
            },
            {
                $unwind: '$fees_info.installments'
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$fees_info.installments.amount'
                    }
                }
            }
        ])

        const getOpeningPendingFees = StudentModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.installment_date': {
                        $lte: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                    }
                }
            },
            {
                $unwind: '$fees_info.installments'
            },
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.status': {$nin: ['Paid']}
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$fees_info.installments.amount'
                    }
                }
            }
        ])

        const getFeesReceivable = StudentModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.installment_date': {
                        $gt: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                    }
                }
            },
            {
                $unwind: '$fees_info.installments'
            },
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.status': {$nin: ['Paid']} // Exclude 'Paid' status
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$fees_info.installments.amount'
                    }
                }
            }
        ])

        const getFeesReceived = StudentModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.payment_date': {
                        $gte: new Date(`${this.reqQuery.startDate}T00:00:00.000Z`),
                        $lte: new Date(`${this.reqQuery.endDate}T23:59:59.999Z`),
                    }
                }
            },
            {
                $unwind: '$fees_info.installments'
            },
            {
                $match: {
                    deleted_at: null,
                    company_id: companyId,
                    'fees_info.installments.status': {$in: ['Paid']}
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$fees_info.installments.amount'
                    }
                }
            }
        ])



        const getNewAdmissions = StudentModel.countDocuments({...studentQuery, status: "Running"});

        const getCourseCompleted = StudentModel.countDocuments({deleted_at: null,
            company_id: companyId, status: 'Completed'});

        const getLeavedStudents = StudentModel.countDocuments({
            deleted_at: null,
            company_id: companyId,
            status: {$nin: ['Completed', 'Running', null]}
        });


        const [expenses, existingAdmissions, newAdmissions, courseCompleted, leavedStudents, feesInfo, studentOpeningPendingFees, studentFeesReceivable, studentFeesReceived] = await Promise.all([
            getExpenses,
            getExistingAdmissions,
            getNewAdmissions,
            getCourseCompleted,
            getLeavedStudents,
            getFeesInfo,
            getOpeningPendingFees,
            getFeesReceivable,
            getFeesReceived
        ]);


        let [expenseData] = expenses ?? [];
        let [feesReceivable] = studentFeesReceivable ?? []
        let [openingPendingFees] = studentOpeningPendingFees ?? []
        let [feesReceived] = studentFeesReceived ?? []

        if (!expenseData) {
            expenseData = {
                expensesByType: [],
                totalExpense: 0
            };
        }if (!feesReceivable) {
            feesReceivable = {
                totalAmount: 0,
            };
        }if (!openingPendingFees) {
            openingPendingFees = {
                totalAmount: 0,
            };
        }if (!feesReceived) {
            feesReceived = {
                totalAmount: 0,
            };
        }

        const data = {
            expenses: expenseData,
            students: {
                existingAdmissions,
                newAdmissions,
                courseCompleted,
                leavedStudents
            },
            feesInfo: {
                openingPendingFees,feesReceivable, feesReceived
            },
            otherInfo: {
                openingCash : 0,
                cashInvestment: 0,
                feesReceived: feesReceived,
                totalExpense: expenseData?.totalExpense,
                withdrawal: 0,
            }
        };

        data.nextMonth = {
            admissions: data.students.existingAdmissions,
            cash: data.otherInfo.openingCash + data.otherInfo.cashInvestment + data.otherInfo.feesReceived - data.otherInfo.withdrawal - data.otherInfo.totalExpense, // Corrected usage of data
            pending_fee: 0
        };

        return data;
    }

}

module.exports = AccountService;