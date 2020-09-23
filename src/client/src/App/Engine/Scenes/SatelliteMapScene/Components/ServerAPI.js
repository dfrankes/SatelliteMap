export default class ServerAPI {
    api_url = `http://api.${window.location.hostname}`;
    constructor() {

    }

    request = async(method, endpoint, data = false, callback = false) => {
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

        if (callback) callback(result);
        return result;
    }
}