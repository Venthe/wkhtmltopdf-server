const asyncHandler = callback =>
    (request, response, next) =>
        Promise.resolve(callback(request, response, next)).catch(next)

module.exports = { asyncHandler }