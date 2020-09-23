module.exports = [{
    method: "post",
    parameters: [],
    custom_url: false,
    middleware: false,
    request: async(req, res, next) => {
        var os = require('os');

        const lat = req.body.lat;
        const lon = req.body.lon;

        const base_url = 'https://landlook.usgs.gov/arcgis/rest/services/LLook_Outlines/MapServer/1/query';
        const params = `?where=MODE='D'&geometry=${lon}, ${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=json`


        const result = await new Promise(resolve => {
            axios.get(base_url + params)
                .then(function(response) {
                    resolve(response);
                })
                .catch(function(error) {
                    console.log(error);
                    resolve(false);
                })
        })


        const data = result.data.features;
        const rowPaths = [];

        data.forEach(item => {
            rowPaths.push({ row: item.attributes.ROW, path: item.attributes.PATH });
        })

        res.json({ success: true, data: rowPaths });
    }
}]

//