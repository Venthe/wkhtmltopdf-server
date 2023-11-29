const express = require('express')
const app = express()
var wkhtmltopdf = require('wkhtmltopdf');

console.log("Starting server")

process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit();
});

app.get('/', function (req, res) {
    // console.debug("Received", req.query)
    const { url, filename, ...config } = req.query
    var stream = wkhtmltopdf(url, config);

    // res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename ?? "print.pdf"}`);
    stream.pipe(res);
})

app.listen(3000)
