var AWS = require('aws-sdk');

module.exports = [{
    method: "get",
    parameters: ['lat', 'lon'],
    custom_url: false,
    middleware: false,
    request: async(req, res, next) => {
        var os = require('os');


        const lat = req.params.lat;
        const lon = req.params.lon;

        // Get ROW and PATH for given lat,lon
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

        let imagesList = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            const images = await SatelliteMap.db.collection('satellitesScenes').find({ row: String(item.attributes.ROW), path: String(item.attributes.PATH) }).toArray();
            imagesList = imagesList.concat(images);
        }

        // Map all images
        let results = [];
        for (let index = 0; index < imagesList.length; index++) {
            const item = imagesList[index];


            const files = await new Promise(async(resolve, reject) => {

                if (item.files && item.files.length > 0) {
                    resolve(item.files);
                }


                let downloadUrl = item.download_url;
                const html = await new Promise(resolve => {
                    axios({ method: 'get', url: downloadUrl }).then(result => resolve(result)).catch(error => {
                        resolve(false);
                    })
                })
                let links = [];
                if (html && html.status === 200) {

                    downloadUrl = downloadUrl.replace('index.html', '');

                    links = matchRegex(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gm, html.data);
                    links = links.concat(matchRegex(/<img src="([^"]*)"/gm, html.data));
                    links = links.map(item => downloadUrl + item);

                    links = links.filter(item => String(item).includes('.jpg'));
                }

                const update = await SatelliteMap.db.collection('satellitesScenes').updateOne({ entityId: item.entityId }, { $set: { files: links } }, { upsert: true });
                resolve(links);
            })
            results.push({
                _id: item._id,
                entityId: item.entityId,
                cloudCover: item.cloudCover,
                date: new Date(item.acquisitionDate),
                path: item.path,
                row: item.row,
                files: files
            })

        }
        res.json({ success: true, satelliteImages: results });
    }
}]


matchRegex = (regex, data) => {
    let results = [];
    let m;
    while ((m = regex.exec(data)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
                results.push(match);
            }
        });
    }
    return results;
}