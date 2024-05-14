// const path = require('path')
// const multer = require('multer')
// const uuid = require("uuid");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'assets/avatars/');
//     },
//     filename: (req, file, cb) => {
//         const fileExtension = path.extname(file.originalname);
//         const fileName = uuid.v4() + fileExtension;
//         cb(null, fileName);
//     },
// });

// const upload = multer({storage});

// module.exports = {upload}


const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadFile = async (fileBuffer) => {
    try {
        const fileSize = fileBuffer.length;
        const maxFileSize = 10 * 1024 * 1024; 

        if (fileSize > maxFileSize) {
            throw new Error("File size exceeds the maximum allowed limit.");
        }

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: "JBS-Admin-Dashboard",
              };
          
            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(result.secure_url);
                }
            }).end(fileBuffer);
        });
    } catch (error) {
        console.log(error.message);
        throw new Error("Error uploading file..");
    }
};

module.exports = { uploadFile };
