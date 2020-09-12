const middleware = async(req, res, next) => {
    let access_key = req.headers.access_key;
    if (access_key !== process.env.access_key) {
        res.json({ success: false, message: 'access_key_not_valid' });
    } else {
        next();
        return;
    }
}

module.exports = { function: middleware, name: 'access_key' };