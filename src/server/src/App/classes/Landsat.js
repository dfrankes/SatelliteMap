class Landsat {
    scene_list = 'https://landsat-pds.s3.amazonaws.com/c1/L8/scene_list.gz'
    constructor() {

    }



    csvToJson = () => {
        const csv2json = require('csv2json');
        const fs = require('fs-extra');

        const source = fs.createReadStream(__dirname + '\\scene_list');
        const output = fs.createWriteStream('..\\server\\tmp\\result.json');
        source.pipe(csv2json()).pipe(output);


        source.on("end", () => console.log('finished'));
    }

    // Add all Satellite Scenes to the database
    // This contains all the images taken by L8
    syncScenes = async() => {


        const data = require('../../../tmp/result.json');
        console.log(`Loaded ${data.length} scene items`);

        const performance = require('perf_hooks').performance;
        let avarageTime = 0;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            const time = performance.now();
            const alreadyImported = await SatelliteMap.db.collection('satellitesScenes').findOne({ entityId: item.entityId });
            if (alreadyImported) {
                continue;
            }

            // 
            // await new Promise(async(resolve, reject) => {

            //     let downloadUrl = item.download_url;
            //     const html = await new Promise(resolve => {
            //         axios({ method: 'get', url: downloadUrl }).then(result => resolve(result)).catch(error => {
            //             resolve(false);
            //         })
            //     })
            //     let links = [];
            //     if (html && html.status === 200) {

            //         downloadUrl = downloadUrl.replace('index.html', '');
            //         links = this.matchRegex(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gm, html.data);
            //         links = links.concat(this.matchRegex(/<img src="([^"]*)"/gm, html.data));
            //         links = links.map(item => downloadUrl + item);
            //     }

            //     item.files = links;
            //     item.date = new Date(item.acquisitionDate);

            //     resolve(true);
            // })

            const insert = await SatelliteMap.db.collection('satellitesScenes').updateOne({ entityId: item.entityId }, { $set: item }, { upsert: true });

            const processingTime = Number((performance.now() - time)).toFixed(2);
            avarageTime = Number(avarageTime) + Number(processingTime);


            const estamatedTime = (avarageTime / i) * (data.length - i) / Number(3.6e+6);
            console.log(`Finished processing item ${i}/${data.length}. Avarage processing time: ${(avarageTime / i)} ms | total estimated time remaining: ${Number(estamatedTime).toFixed(2)} hours`);

        }


    }

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


}

module.exports = Landsat;