const handleException = require("../decorators/error");
const Joi = require("joi");
const StudentService = require("../services/student");
const studentRouter = require("express").Router()
const mongoose = require('mongoose');
const Student = require("../models/student");
const multer = require("multer");
// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {uploadFile} = require("../helpers/avatar");
const User = require("../models/User");
const {ResourceNotFoundError} = require("../errors/userErrors");
const {BadRequestError} = require("../errors/userErrors");

studentRouter.post("/:companyId/student", upload.single("profile-pic"), handleException(async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const studentServ = new StudentService(req.body, req.user, req.query);

        let data;

        if (req.file && req.file.buffer) {
            const result = await uploadFile(req.file.buffer);
            data = await studentServ.createStudent(companyId, result);
        } else {
            console.log("I am calloing")
            data = await studentServ.createStudent(companyId);
            console.log("data",data)
        }

        res.json({
            data,
            status: 200,
            message: "Student created successfully."
        });

    } catch (err) {
        if (err.message === "File size exceeds the maximum allowed limit.") {
            res.status(400).json({ status: 400, message: err.message });
        } else if (err instanceof BadRequestError) {
            res.status(err.status).json({ status: err.status, message: err.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}));


studentRouter.get("/:companyId/student", handleException(async (req, res) => {
    try {
        const studentServ = new StudentService(req, res, req.query);
        const companyId = req.params.companyId;
        const data = await studentServ.getStudents(companyId);

        res.json({
            data: {
                message: "Students retrieved successfully.",
                students: data.filteredStudent,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalStudents: data.total,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));

studentRouter.get("/:companyId/:id/student", handleException(async (req, res) => {
    try {
        const studentServ = new StudentService(req, res, req.query);
        const id = req.params.id;
        const data = await studentServ.getStudent(id);

        res.json({
            data: {
                message: "Student retrieved successfully.",
                student: data,
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

studentRouter.put("/:companyId/:id/updateStudent", handleException(async (req, res) => {
    try {
        const userId = req.params.id
        const studentServ = new StudentService(req.body, req.user);
        const data = await studentServ.updateStudent(userId);

        res.json({
            data: {
                message: "Student updated successfully.",
                student: data,
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

studentRouter.delete("/:companyId/:id/deleteStudent", handleException(async (req, res) => {
    try {
        const userId = req.params.id;
        const studentServ = new StudentService();
        const data = await studentServ.deleteStudent(userId);

        res.json({
            data: {
                message: "Student deleted successfully.",
                student: data,
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

studentRouter.delete("/:companyId/:id/:entryId/deleteGuardian", handleException(async (req, res) => {
    try {
        const userId = req.params.id;
        const entryId = req.params.entryId;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(entryId)) {
            return res.status(400).json({ message: 'Invalid user ID or entry ID' });
        }

        const studentServ = new StudentService();
        const data = await studentServ.deleteStudentGuardian(userId, entryId);

        if (!data) {
            return res.status(404).json({ messsage: "Guardian not found for the given student ID and entry ID" });
        }

        res.json({
            data: {
                message: "Student Guardian deleted successfully.",
                student: data,
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

studentRouter.put("/:companyId/:id/:guardianId/update-guardian", handleException(async (req, res) => {
    try {
        const userId = req.params.id;
        const guardianId = req.params.guardianId;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(guardianId)) {
            return res.status(400).json({ message: 'Invalid user ID or entry ID' });
        }

        const studentServ = new StudentService(req.body, req.user, req.query);
        const data = await studentServ.updateStudentGuardian(userId, guardianId);

        if (!data) {
            return res.status(404).json({ message: "Guardian not found for the given student ID and entry ID" });
        }

        res.json({
            data: {
                message: "Student Guardian updated successfully.",
                student: data,
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

studentRouter.put(
    "/student/:id/profile-pic",
    upload.single("profile-pic"),
    handleException(async (req, res) => {
        const studentId = req.params.id;
        const file = req.file;
        const imageUrl = await uploadFile(file.buffer);


        const studentData = await Student.findById(studentId)

        if(!studentData){
            return res.status(404).json({ message: "Student not found" });
        }

        studentData.personal_info.profile_pic = imageUrl

        await studentData.save()

        const user = await User.findOne({ _id: studentData.student_user_id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.avatar_url = imageUrl;

        await user.save();

        res.json({
            data: {
                message: "Profile pic uploaded successfully",
            },
        });
    })
);

studentRouter.delete("/:companyId/delete/all-students", handleException(async (req, res) => {
    try {
        const empServ = new StudentService(req, res, req.query);
        const data = await empServ.deleteMultipleStudents();

        res.json({
            data: {
                message: "Students deleted successfully",
                student: data,
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


module.exports = studentRouter;
