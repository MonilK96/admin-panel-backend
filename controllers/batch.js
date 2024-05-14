const Joi = require("joi");
const handleException = require("../decorators/error");
const BatchService = require("../services/batch");
const batchRouter = require("express").Router();
const mongoose = require('mongoose');
const StudentService = require("../services/student");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");

const CreateBatchRequest = Joi.object({
    technology: Joi.string().required(),
    batch_time: Joi.date().required(),
    note: Joi.string().optional(),
    lab_name: Joi.string().optional(),
    batch_members: Joi.array().items(
        Joi.object({
            student_id: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        })
    )
});

batchRouter.post("/:companyId/batch", handleException(async (req, res) => {
    try {
        const reqBody = await CreateBatchRequest.validateAsync(req.body);
        const companyId = req.params.companyId;
        const batchServ = new BatchService(reqBody, req.user);
        const result = await batchServ.createBatch(companyId);

        res.json({
            data: {
                message: "Batch created successfully.",
                batch: result,
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

batchRouter.get("/:companyId/batch", handleException(async (req, res) => {
    try {
        const batchServ = new BatchService(req, res, req.query);
        const companyId = req.params.companyId;
        const data = await batchServ.getBatches(companyId);

        res.json({
            message: "Batch retrieved successfully.",
            data,
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError || err instanceof BadRequestError ) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

batchRouter.get("/:companyId/:id/batch", handleException(async (req, res) => {
    try {
        const batchServ = new BatchService(req, res, req.query);
        const batch = await batchServ.getBatch();

        res.json({
            data: {
                message: "Batch retrieved successfully.",
                batch
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

batchRouter.put("/:companyId/:id/updateBatch", handleException(async (req, res) => {
    try {
        const batchId = req.params.id;
        const batchServ = new BatchService(req, res, req.body);
        const batch = await batchServ.updateBatch(batchId);

        res.json({
            data: {
                message: "Batch updated successfully.",
                batch
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

batchRouter.delete("/:companyId/:id/deleteBatch", handleException(async (req, res) => {
    try {
        const batchId = req.params.id;
        const batchServ = new BatchService(req, res, req.body);
        const batch = await batchServ.deleteBatch(batchId);

        res.json({
            data: {
                message: "Batch deleted successfully.",
                batch
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

batchRouter.delete("/:companyId/batches/multiple-batches", handleException(async (req, res) => {
    try {
        const batchServ = new BatchService(req, res, req.query);
        const data = await batchServ.deleteMultipleBatches();

        res.json({
            data: {
                message: "Batches deleted successfully",
                student: data,
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

batchRouter.delete("/:companyId/:id/:entryId/deleteBatch", handleException(async (req, res) => {
    try {
        const userId = req.params.id;
        const entryId = req.params.entryId;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(entryId)) {
            return res.status(400).json({ error: 'Invalid user ID or entry ID' });
        }

        const batchServ = new BatchService();
        const batch = await batchServ.deleteBatchMember(userId, entryId);

        if (!batch) {
            return res.status(404).json({ error: "Batch not found for the given member ID and entry ID" });
        }

        res.json({
            data: {
                message: "Batch member deleted successfully.",
                batch
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

batchRouter.delete("/:companyId/:id/delete-members", handleException(async (req, res) => {
    try {
        const userId = req.params.id;
        const entryIds = req.body.entryIds;

        const batchServ = new BatchService();
        const members = await batchServ.deleteMultipleBatchMember(userId, entryIds);

        if (!members) {
            return res.status(404).json({ error: "Batch not found for the given member ID and entry ID" });
        }

        res.json({
            data: {
                message: "Batch member deleted successfully.",
                members
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

module.exports = batchRouter;