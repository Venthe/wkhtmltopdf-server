const express = require('express')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { asyncHandler } = require('./handler')
const { genericErrorHandler, errorLoggingHandler } = require('./middleware')
const { getConfigurationFromMultipartData, getFiles } = require('./request')
const toPdf = require('./to-pdf')

const port = 3000
const app = express()
const upload = multer();
const router = express.Router()

process.on('SIGINT', () => {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit();
});

app.get('/', asyncHandler(async (request, response) => toPdf(request.query, { response })))

router.post('/', asyncHandler(async (request, response, next) => {
    const contentType = request.headers["content-type"];
    if (!contentType.includes("application/json")) {
        return next('route')
    }

    return toPdf(request.body, { response });
}))

router.post('/', upload.any(), async (request, response, next) => {
    const contentType = request.headers["content-type"];
    if (!contentType.includes("multipart/form-data")) {
        return next('route')
    }
    const config = getConfigurationFromMultipartData(request.files);
    const files = getFiles(request.files)

    return toPdf({ ...config, files }, { response });
})

router.post("/", (request, response, next) => {
    const contentType = request.headers["content-type"];
    res.status(415);
    res.render('error', { error: `Unsupported content type: ${contentType}` });
})

app.get("/contract", (request, response) => {
    response.status(200);
    response.setHeader("Content-Type", "application/x-yaml")
    response.send(fs.readFileSync(path.join(process.env["SOURCE_WORKDIR"] ?? __dirname, 'contract.yaml')))
})

app.get('/selftest', (request, response) => {
    response.setHeader("Content-Type", "text/html")
    response.send("<html><body><h1>Hello world!</h1></body></html>")
})

app.use(express.json(), router, errorLoggingHandler, genericErrorHandler)

app.listen(port, () => {
    console.log(`Server started at: ${port}`);
})
