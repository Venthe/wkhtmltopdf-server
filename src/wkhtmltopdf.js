const _wkhtmltopdf = require('wkhtmltopdf');
const { fork } = require('child_process')
const path = require('path')
const fs = require('fs')

const wkhtmltopdf = ({ url, ...config }, callback) => {
    console.debug(`[CONVERTER] Converting URL: ${url}`);
    return _wkhtmltopdf(url, config, callback);
}

const convert = ({ cwd, ...config }) => {
    return new Promise((resolve, reject) => {
        const source = path.join(process.env["SOURCE_WORKDIR"] ?? __dirname, 'wkhtmltopdf.app.js');
        const child = fork(`${source}`, { cwd, timeout: 10000 });

        child.send(JSON.stringify(config));

        child.on("exit", (code) => {
            if (code === 0) resolve("SUCCESS");
            reject("[CONVERTER] ERROR");
        });

        child.on("message", msg => {
            const { result } = JSON.parse(msg);
            console.debug("[CONVERTER] Conversion finished", msg)
            resolve(fs.createReadStream(path.join(cwd, result)));
        });

        child.on("error", (err) => {
            console.error("[CONVERTER] Error", err);
            reject("[CONVERTER] ERROR");
        });
    })
}

module.exports = { wkhtmltopdf, convert }