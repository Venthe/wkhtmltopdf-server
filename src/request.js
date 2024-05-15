const getConfigurationFromMultipartData = (multipart) => {
    const rawConfiguration = multipart.filter(file => file.fieldname === "configuration").filter(file => file.mimetype === "application/json")[0]
    return JSON.parse(rawConfiguration.buffer)
}

const getFiles = (multipart) => {
    return multipart.filter(file => file.fieldname === "files[]")
}

module.exports = {
    getConfigurationFromMultipartData,
    getFiles
}