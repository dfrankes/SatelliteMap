module.exports = [{
        method: "post",
        parameters: [],
        custom_url: false,
        middleware: false,
        request: async(req, res, next) => {
            const query = req.body.query;
            let results = await SatelliteMap.db.collection('satellites').find({ name: { "$regex": query, '$options': 'i' } }, { limit: 25 }).toArray();
            results = results.map(result => {
                result.text = result.name;
                result.id = result.satelliteId
                return result;
            })


            res.json({ results: results });
        }
    },
    {
        method: "get",
        parameters: ['satalliteId'],
        custom_url: false,
        middleware: false,
        request: async(req, res, next) => {
            const satId = req.params.satalliteId;
            let satallite = await SatelliteMap.db.collection('satellites').findOne({ satelliteId: parseInt(satId) });
            res.json({ satallite });
        }
    }
]