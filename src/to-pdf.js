const fs = require('fs');
const path = require('path');

const { inDirectory } = require('./in-directory')
const { convert } = require("./wkhtmltopdf")

module.exports = ({ url, filename, files, ...config } = { files: [] }, { response }) => inDirectory((cwd, cleanup) => {
    files?.forEach(file => {
        fs.writeFileSync(path.join(cwd, file.originalname), file.buffer);
    });

    return convert({ cwd, url, ...config })
        .then(stream => {
            if (filename && filename.length > 0) {
                response.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            }

            response.setHeader('Content-Type', 'application/pdf');

            stream.on("end", () => {
                cleanup.resolve();
            });

            stream.pipe(response);
        }).catch(err => cleanup.reject(err));
})