const errorLoggingHandler = (error, request, response, next) => {
    if (error) {
        console.error("Captured error:", typeof error === 'string' ? (((arr) => [arr[0], arr[1], arr[2]].filter(a=>!!a).join("\n").trim())(error.split("\n"))) : error)
        next(error)
    }

    next()
}

const genericErrorHandler = (error, request, response, next) => {
    if (response.headersSent) {
        return next(error)
    }
    response.status(500)
    response.send(error)
}

module.exports = { genericErrorHandler, errorLoggingHandler }