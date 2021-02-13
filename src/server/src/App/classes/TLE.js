const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");

class TLE {
    api_url = 'http://data.ivanstanojevic.me/api/tle';

    constructor() {

    }


    request = async(method, endpoint, data = false) => {
        let result = await new Promise((resolve, reject) => {

            let requestConfig = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                url: `${this.api_url}/${endpoint}`,
            }

            if (data) {
                requestConfig.data = data;
            }

            axios(requestConfig).then(result => resolve(result)).catch(error => { resolve({ success: false, data: error.response.data }) });
        });
        return result;
    }

    searchSatellite = async(q) => {
        const endpoint = `?search=${q}`;
        const request = await this.request('GET', endpoint);
        return request;
    }

    getSatellite = async(id) => {
        const endpoint = `/${id}`;
        const request = await this.request('GET', endpoint);
        return request;
    }

    getAllSatellites = async() => {
        const request = await this.request('GET', '?page-size=100');
        const totalItems = request.data.totalItems;
        const maxPerPage = 100;

        let members = [].concat(request.data.member);

        const pages = totalItems / maxPerPage;
        for (let i = 2; i <= pages; i++) {
            const page = await this.request('GET', '?page-size=100&page=' + i);
            members = members.concat(page.data.member);

            console.log(`processed page ${i} out of ${pages}`);
        }

        for (let index = 0; index < members.length; index++) {
            let member = {
                name: members[index].name,
                satelliteId: members[index].satelliteId,
                date: members[index].date,
                lines: [members[index].line1, members[index].line2]
            };
            // Get Satellite Info
            const tle = [
                member.name,
                member.lines[0],
                member.lines[1]
            ];

            try {
                member.info = await getSatelliteInfo(tle, new Date().getTime());
            } catch (error) {
                member.info = error.message;
            }
            const insert = await SatelliteMap.db.collection('satellites').updateOne({ satelliteId: member.satelliteId }, { $set: member }, { upsert: true })
        }
        console.log("process finished");
    }
}

module.exports = TLE;