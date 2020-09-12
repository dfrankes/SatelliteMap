module.exports = [{
    method: "get", // Maps to the HTTP METHOD | get, head, post, put, delete, patch
    parameters: [], // Parameters for this router (for example /my/path/:id/overview will be ['id'])
    custom_url: '/', // Overwrite the path for this route (will still include parameters)
    middleware: false, // Set middleware for just this request (GET)
    request: async(req, res, next) => { // Function to be executed on request hit
        var os = require('os');
        res.json({ hello_from: os.hostname() })
    }
}]