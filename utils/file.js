const fs = require("fs");

const deleteFile = (filePath) => {
    fs.unlink(filePath, (error) => {
            if (error) {
                console.log(error);
            }
    });
};

exports.deleteFile = deleteFile;