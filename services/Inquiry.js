const BaseService = require(".");
const Inquiry = require('../models/inquiry');
const mongoose = require('mongoose');
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");
const Student = require("../models/student");

class InquiryService extends BaseService {
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async createInquiry(companyId) {
        const {
            firstName,
            lastName,
            occupation,
            contact,
            email,
            education,
            dob,
            address_line1,
            address_line2,
            city,
            state,
            zip_code,
            country,
            reference_by,
            fatherName,
            father_contact,
            father_occupation,
            interested_in,
            suggested_by
        } = this.req;









        const isUserExists = await Inquiry.findOne({ $or: [{ contact }, { email }] });


        if (isUserExists) {
            throw new BadRequestError("Inquiry already exists.");
        }

        const newInquiry = new Inquiry({
            firstName,
            lastName,
            occupation,
            contact,
            email,
            education,
            dob,
            address: {
                address_line1,
                address_line2,
                city,
                state,
                country,
                zip_code
            },
            reference_by,
            fatherName,
            father_contact,
            father_occupation,
            interested_in,
            suggested_by,
            company_id: companyId
        });

        const savedInquiry = await newInquiry.save();

        return savedInquiry;
    }

    async getInquirys(companyId) {
        let query = { deleted_at: null, company_id: companyId };

        const searchKey = this.reqQuery.searchKey;

        if (searchKey) {
            query = {
                deleted_at: null,
                $or: [
                    { firstName: { $regex: new RegExp(searchKey, 'i') } },
                    { email: { $regex: new RegExp(searchKey, 'i') } },
                    { contact: { $regex: new RegExp(searchKey, 'i') } },
                ],
            };
        }

        let inquiries
        let total
        if (this.reqQuery.page && this.reqQuery.limit) {
            const page = parseInt(this.reqQuery.page) || 1;
            const limit = parseInt(this.reqQuery.limit) || 10;
            const startIndex = (page - 1) * limit;

            inquiries = await Inquiry.find(query)
                .skip(startIndex)
                .limit(limit);

            total = await Inquiry.countDocuments(query);
        } else {
            inquiries = await Inquiry.find(query);
            total = inquiries.length;
        }
        return { inquiries, total };
    }

    async getInquiry() {
        const inquiryId = this.req.params.id;

        const inquiry = await Inquiry.findOne({
            _id: inquiryId,
            deleted_at: null
        });

        if (!inquiry) {
            throw new ResourceNotFoundError('Inquiry not found');
        }

        return inquiry;
    }

    async updateInquiry() {
        const inquiryId = this.req.params.id;
        const updates = this.req.body;

        const existingInquiry = await Inquiry.findById(inquiryId);

        if (!existingInquiry) {
            throw new ResourceNotFoundError('Inquiry not found');
        }

        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            inquiryId,
            { $set: updates },
            { new: true }
        );

        return updatedInquiry;
    }

    async deleteInquiry() {
        const inquiryId = this.req.params.id;

        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            inquiryId,
            { $set: { deleted_at: new Date() } },
            { new: true }
        );

        if (!updatedInquiry) {
            throw new ResourceNotFoundError('Inquiry not found');
        }

        return updatedInquiry;
    }

    async deletemultipalInquiry() {
        const idsToDelete = this.req.body.ids;  
        const result = await Inquiry.updateMany(
            { _id: { $in: idsToDelete } },
            { $set: { deleted_at: new Date() } }
        );
        return result;
    }
}

module.exports = InquiryService;