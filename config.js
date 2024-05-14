const path = require("path");
const process = require("process");

const isExecutable = !!process.pkg?.entrypoint;
module.exports.IS_EXECUTABLE = isExecutable;
module.exports.ROOT_DIR = this.IS_EXECUTABLE
    ? process.cwd()
    : path.dirname(path.resolve(__dirname));
module.exports.LOG_DIR = path.join(this.ROOT_DIR, ".logs");
module.exports.UPLOADS_DIR = path.join(this.LOG_DIR, "uploads");

require("dotenv").config(
    isExecutable
        ? {
            path: `${__dirname}/../.env.binary`,
        }
        : undefined
);
