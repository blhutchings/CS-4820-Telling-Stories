const os = require('os');
const { Request } = require('express')
const fsExtra = require('fs-extra')

async function clearTempFiles(req) {
    if (!req.files) {
        return;
    }

    await Promise.all(
        Object.keys(req.files).map((file) =>
            req.files[file].tempFilePath !== undefined &&
                req.files[file].tempFilePath !== ''
                ? fsExtra.remove(req.files[file].tempFilePath)
                : Promise.resolve()
        )
    );
}
module.exports = { clearTempFiles }