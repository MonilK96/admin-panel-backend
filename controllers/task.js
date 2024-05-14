const handleException = require("../decorators/error");
const Joi = require("joi");
const TaskService = require("../services/task");
const taskRouter = require("express").Router();
const mongoose = require('mongoose');
const Task = require("../models/task");
const {ResourceNotFoundError} = require("../errors/userErrors");

const CreateTaskRequest = Joi.object({
    role: Joi.string().required(),
    assign_id: Joi.string().required(),
    task_title: Joi.string().required(),
    fullName: Joi.string().required(),
    create_date: Joi.date().required(),
    due_date: Joi.date().required(),
    priority: Joi.string().required(),
    status: Joi.string().required(),
    task_info: Joi.array().items(Joi.object({
        task: Joi.string().required(),
        queries: Joi.string()
    })),
});

taskRouter.post("/:companyId/task", handleException(async (req, res) => {
    try {
        const reqBody = await CreateTaskRequest.validateAsync(req.body);
        const companyId = req.params.companyId;
        const taskServ = new TaskService(reqBody, res); 
        const data = await taskServ.createTask(companyId);

        res.json({
            data: {
                message: "Task created successfully.",
                task: data,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));

taskRouter.get("/:companyId/:assignId/task", handleException(async (req, res) => {
    const { companyId, assignId } = req.params;

    try {
        const taskServ = new TaskService(req, res, req.query);
        const tasksData = await taskServ.getTasks(companyId, assignId);

        res.json({
            data: {
                message: "Tasks retrieved successfully.",
                tasks: tasksData.tasks,
                totalData: tasksData.totalData,
                totalPages: tasksData.totalPages,
                currentPage: tasksData.currentPage,
                pageSize: tasksData.pageSize,
            },
        });

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

taskRouter.get("/:companyId/:taskId/tasks", handleException(async (req, res) => {
    const { companyId, taskId } = req.params;

    try {
        const taskServ = new TaskService(req, res, req.query);
        const data = await taskServ.getSingleTasks(companyId, taskId);

        res.json({
            data: {
                data,message: "Tasks retrieved successfully."
            },
        });

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

taskRouter.put("/:companyId/:taskId/updateTask", handleException(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const taskServ = new TaskService(req, res, req.query);
        const updatedTask = await taskServ.updateTask(taskId);

        res.json({
            data: {
                message: "Task updated successfully.",
                task: updatedTask,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));

taskRouter.delete("/:companyId/:taskId/deleteTask", handleException(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const taskServ = new TaskService(req, res, req.query);
        const deletedTask = await taskServ.deleteTask(taskId);

        res.json({
            data: {
                message: "Task deleted successfully.",
                task: deletedTask,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));

taskRouter.delete("/:companyId/:taskId/:infoId/deleteTask", handleException(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const infoId = req.params.infoId;
        const taskServ = new TaskService(req, res, req.query);
        await taskServ.deleteTaskInfo(taskId, infoId);

        res.json({
            data: {
                message: "Task info deleted successfully.",
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));

taskRouter.delete("/:companyId/delete/multiple", handleException(async (req, res) => {
    try {
        const taskServ = new TaskService(req, res, req.query);
        const data = await taskServ.deletemultipleTask();

        res.json({
            data: {
                message: "Multiple Task deleted successfully",
                task: data,
            },
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            res.status(err.status).json({status: err.status, message: err.message});
        } else {
            return res.status(500).json({message: "Internal server error"});
        }
    }
}));


module.exports = taskRouter;
