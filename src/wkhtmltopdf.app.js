const { wkhtmltopdf } = require("./wkhtmltopdf")

process.on('message', (msg) => {
    console.log("[WORKER] Initiating conversion.", process.cwd())

    const config = JSON.parse(msg)
    wkhtmltopdf({...config, output: "__out.pdf"}, () => {
        process.send(JSON.stringify({result: "__out.pdf"}))
    
        console.log("[WORKER] Conversion done.")
        process.exit(0)
    })
});