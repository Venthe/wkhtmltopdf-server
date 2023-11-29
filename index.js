const express = require('express')
const app = express()
var wkhtmltopdf = require('wkhtmltopdf');

console.log("Starting server")

app.use(express.json())

process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit();
});

process.on('uncaughtException', function (err) {
    console.log('UNCAUGHT EXCEPTION - keeping process alive:', err);
});

const toPdf = (response, url, filename, config) => {
    var stream = wkhtmltopdf(url, config);
    if (filename && filename.length > 0) {
        response.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    }
    response.setHeader('Content-Type', 'application/pdf');
    stream.pipe(response);
}

app.get('/', function (request, response) {
    const { url, filename, ...config } = request.query
    toPdf(response, url, filename, config)
})

app.post('/', function (request, response) {
    const { url, filename, ...config } = request.body
    console.log(request.body)
    toPdf(response, url, filename, config)
})

app.listen(3000)
