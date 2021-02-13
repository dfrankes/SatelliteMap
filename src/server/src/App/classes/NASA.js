export default class NASA {
    api_key = 'DEMO_KEY';
    api_url = ''
    constructor() {

    }


    request = async(method, url, data = false) => {
        let result = await new Promise((resolve, reject) => {

            let requestConfig = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                url: `${api_url}/${endpoint}`,
            }

            if (data) {
                requestConfig.data = data;
            }

            axios(requestConfig).then(result => resolve({ success: true, data: result.data.data })).catch(error => { resolve({ success: false, data: error.response.data }) });
        });
        return result;
    }
}