const BaseService = require(".");
const mongoose = require("mongoose");
const Batch = require("../models/batch");
const Student = require("../models/student");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");

class BatchService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async createBatch(companyId) {
        const {
            technology,
            batch_time,
            note,
            lab_name,
            batch_members
        } = this.req;

        const existingBatch = await Batch.findOne({
            technology,
            batch_time,
            'batch_members.student_id': {$in: batch_members.map(member => member.student_id)},
            'batch_members.deleted_at': null,
            company_id: companyId
        });

        if (existingBatch) {
            throw new BadRequestError(`Batch Already Exists.`);
        }

        const populatedBatchMembers = await Promise.all(
            batch_members.map(async (member) => {
                const studentDetails = await Student.findOne({
                    "_id": member.student_id,
                });

                if (studentDetails) {
                    return {
                        student_id: member.student_id,
                        firstName: studentDetails.personal_info.firstName,
                        lastName: studentDetails.personal_info.lastName,
                        contact: studentDetails.personal_info.contact,
                        course: studentDetails.personal_info.course,
                        joining_date: studentDetails.personal_info.joining_date,
                    };
                } else {
                    throw new ResourceNotFoundError(`Student not found with ID: ${member.student_id}`);
                }
            })
        );

        const newBatch = new Batch({
            technology,
            batch_time,
            note,
            lab_name,
            company_id: companyId,
            batch_members: populatedBatchMembers,
        });

        const savedBatch = await newBatch.save();
        return savedBatch;
    }

    async getBatches(companyId) {

        let query = {deleted_at: null, company_id: companyId};
        const searchKey = this.reqQuery.searchKey;

        if (searchKey) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(searchKey)) {
                query = {
                    deleted_at: null,
                    batch_time: {
                        $gte: new Date(searchKey),
                        $lt: new Date(new Date(searchKey).setDate(new Date(searchKey).getDate() + 1))
                    }
                };
            } else {
                query = {
                    deleted_at: null,
                    $or: [
                        {"lab_name": {$regex: new RegExp(searchKey, 'i')}},
                        {"technology": {$regex: new RegExp(searchKey, 'i')}}
                    ]
                };
            }
        }

        let filteredBatches
        let total
        if (this.reqQuery.page && this.reqQuery.limit) {
            const page = parseInt(this.reqQuery.page) || 1;
            const limit = parseInt(this.reqQuery.limit) || 10;
            const startIndex = (page - 1) * limit;

            filteredBatches = await Batch.find(query)
                .skip(startIndex)
                .limit(limit);

            total = await Batch.countDocuments(query);
        } else {
            filteredBatches = await Batch.find(query);
            total = filteredBatches.length;
        }

        const batches = filteredBatches.map(demo => ({
            ...demo.toObject(),
            batch_members: demo.batch_members.filter(entry => entry.deleted_at === null)
        }));

        return {
            batches,
            total
        };

    }

    async getBatch() {
        const batchId = this.req.params.id;
        const page = parseInt(this.reqQuery.page) || 1;
        const limit = parseInt(this.reqQuery.limit) || 10;
        const startIndex = (page - 1) * limit;

        const batch = await Batch.findOne({
            _id: batchId,
            deleted_at: null
        });

        if (!batch) {
            throw new ResourceNotFoundError("Batch not found.");
        }

        const totalBatchMembers = batch.batch_members.length;
        batch.batch_members = batch.batch_members.filter(entry => entry.deleted_at === null).slice(startIndex, startIndex + limit);

        const responseData = {
            batch_members: batch,
            total: totalBatchMembers,
            currentPage: page,
            totalPages: Math.ceil(totalBatchMembers / limit),
            per_page: limit
        };

        return responseData;
    }

    async updateBatch(batchId) {

        const batch = await Batch.findByIdAndUpdate(batchId, this.req.body, {new: true});

        if (!batch) {
            throw new ResourceNotFoundError('Batch not found');
        }

        return batch;
    }

    async deleteBatch(batchId) {
        const deletedBatch = await Batch.findByIdAndUpdate(
            batchId,
            {$set: {deleted_at: new Date()}},
            {new: true}
        );

        if (!deletedBatch) {
            throw new ResourceNotFoundError("User not found");
        }

        return deletedBatch;
    }

    async deleteBatchMember(userId, entryId) {

            const batch = await Batch.findById(userId);

            if (!batch) {
                throw new ResourceNotFoundError("Batch not found");
            }

            const batchIndex = await Batch.findOneAndUpdate(
                {_id: userId, 'batch_members._id': entryId},
                {
                    $set: {
                        'batch_members.$.deleted_at': new Date()
                    }
                },
                {
                    new: true
                }
            );

            if (!batchIndex) {
                throw new ResourceNotFoundError("Batch Member not found");
            }

            return batchIndex;

    }

    async deleteMultipleBatchMember(userId, entryIds) {
            const batch = await Batch.findById(userId);

            if (!batch) {
                throw new ResourceNotFoundError("Batch not found");
            }

            const result = await Batch.updateMany(
                {_id: userId, 'batch_members._id': {$in: entryIds}},
                {
                    $set: {
                        'batch_members.$.deleted_at': new Date()
                    }
                }, {new: true}
            );

            if (!result) {
                throw new ResourceNotFoundError("Batch Members not found");
            }

            return result;


    }

    async deleteMultipleBatches() {
        const idsToDelete = this.req.body.ids;
        const result = await Batch.updateMany(
            {_id: {$in: idsToDelete}},
            {$set: {deleted_at: new Date()}}
        );
        return result;
    }
}


module.exports = BatchService;






