const _wkhtmltopdf = require('wkhtmltopdf');
const { fork } = require('child_process')
const path = require('path')
const fs = require('fs')

const wkhtmltopdf = ({ url, ...config }, callback) => {
    console.debug(`[CONVERTER] Converting URL: ${url}`);
    return _wkhtmltopdf(url, config, callback);
}

const rejectError = (err, reject) => {
    reject((typeof err) === 'number' ? new Error(err) : err);
}

const convert = ({ cwd, ...config }) => new Promise((resolve, reject) => {
    if (!config.url) throw new Error("URL must be present!")

    console.debug(`[CONVERTER] Received request: ${config.url}`);
    const source = path.join(process.env["SOURCE_WORKDIR"] ?? __dirname, 'wkhtmltopdf.app.js');
    const child = fork(`${source}`, { cwd, timeout: 10000 });

    child.send(JSON.stringify(config));

    child.on("exit", (code) => {
        if (code !== 0) rejectError(code, reject);

    });

    child.on("close", (code) => {
        if (code !== 0) rejectError(code, reject);
    });

    child.on("message", msg => {
        const { result, error } = JSON.parse(msg);

        if (!!error) {
            console.error("[CONVERTER] Conversion failed");
            rejectError(error, reject)
        } else {
            console.debug("[CONVERTER] Conversion finished");
            resolve(fs.createReadStream(path.join(cwd, result)));
        }
    });

    child.on("error", (err) => {
        rejectError(err, reject);
    });
})

module.exports = { convert, wkhtmltopdf }
