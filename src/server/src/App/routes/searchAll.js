module.exports = [
    {
        method: "get",
        parameters: [],
        custom_url: false,
        middleware: false,
        request: async(req, res, next) => {

            let satallites = await SatelliteMap.db.collection('satellites').find({}).toArray();
            if(req.query.returnCount === 'true'){
                return res.json(satallites.length || 0);
            }

            return res.json(satallites || []);
        }
    }
]