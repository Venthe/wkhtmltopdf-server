const express = require('express')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { inDirectory } = require('./in-directory')
const { wkhtmltopdf, convert } = require("./wkhtmltopdf")

const app = express()
const upload = multer();
const router = express.Router()

console.log("Starting server")

app.use(express.json(), router, (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit();
});

process.on('uncaughtException', function (err) {
    console.error('UNCAUGHT EXCEPTION - keeping process alive:', err);
});

const _toPDF = (response, url, stream, { filename, resolve, reject } = {}) => {
    console.debug(`Received request: ${url}`);

    if (filename && filename.length > 0) {
        response.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    }
    response.setHeader('Content-Type', 'application/pdf');

    stream.on("end", () => {
        resolve?.()
    })

    stream.pipe(response);
}

const toPdf = (response, url, filename, config, { resolve, reject } = {}) => {
    _toPDF(response, url, wkhtmltopdf({ url, ...config }), { filename, resolve, reject })
}

const toPdf2 = (response, url, filename, config, files, { resolve, reject } = {}) => {
    inDirectory((dir, cleanup) => {
        files.forEach(file => {
            fs.writeFileSync(path.join(dir, file.originalname), file.buffer);
        })

        convert({ cwd: dir, url, ...config }).then(stream => {

            stream.on("end", () => {
                cleanup.resolve()
            })

            _toPDF(response, url, stream, { filename, resolve, reject })
        })
    })
}

const getConfigurationFromMultipartData = (multipart) => {
    const rawConfiguration = multipart.filter(file => file.fieldname === "configuration").filter(file => file.mimetype === "application/json")[0]
    return JSON.parse(rawConfiguration.buffer)
}

const getFiles = (multipart) => {
    return multipart.filter(file => file.fieldname === "files[]")
}

app.get('/', (request, response) => {
    const { url, filename, ...config } = request.query;
    toPdf(response, url, filename, config);
})

app.get('/selftest', (request, response) => {
    response.send("<html><body><h1>Hello world!</h1></body></html>")
})

router.post('/', (request, response, next) => {
    const contentType = request.headers["content-type"];
    if (!contentType.includes("application/json")) {
        next('route')
        return
    }

    const { url, filename, ...config } = request.body;
    toPdf(response, url, filename, config);
})

router.post('/', upload.any(), (request, response, next) => {
    const contentType = request.headers["content-type"];
    if (!contentType.includes("multipart/form-data")) {
        next('route')
        return
    }

    return new Promise((resolve, reject) => {
        const { url, filename, ...config } = getConfigurationFromMultipartData(request.files);
        console.log(url, filename, config)
        toPdf2(response, url, filename, config, getFiles(request.files), { resolve, reject });
    })
})

router.post("/", (request, response, next) => {
    const contentType = request.headers["content-type"];
    res.status(415);
    res.render('error', { error: `Unsupported content type: ${contentType}` });
})

app.listen(3000, () => {
    console.log("Server started");
})
