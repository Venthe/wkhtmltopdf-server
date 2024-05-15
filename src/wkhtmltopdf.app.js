const { wkhtmltopdf } = require("./wkhtmltopdf")

process.on('message', (msg) => {
    console.log("[WORKER] Initiating conversion.", process.cwd())

    const config = JSON.parse(msg)
    wkhtmltopdf({ ...config, output: "__out.pdf" }, (error, stream) => {
        if (error) {
            console.error("[WORKER] Conversion failed.");
            process.send(JSON.stringify({ error: error.message }));
            process.exit(1);
        }

        process.send(JSON.stringify({ result: "__out.pdf" }))

        console.debug("[WORKER] Conversion done.")
        process.exit(0)
    })
});
