const path = require('path');
const uuid = require('uuid')
const fs = require('fs');

const clearDirectory = (directory) => {
    console.debug("Clearing directory", directory)
    fs.rmSync(directory, {force: true, recursive: true})
}

const inDirectory = (callback) => {
    const directory = path.join(process.env["CONVERTER_WORKDIR"] ?? __dirname, uuid.v4());
    fs.mkdirSync(directory)

    process.on('SIGINT', () => {
        clearDirectory(directory)
    });

    const promise = new Promise((resolve, reject) => {
        callback(directory, { resolve, reject }).catch(reject);
    });
    return promise.finally(() => clearDirectory(directory))
}

module.exports = { inDirectory }