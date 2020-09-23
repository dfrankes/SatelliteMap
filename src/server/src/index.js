/*
    SatelliteMap-API Application
 */

require('.\\App\\includes.js');
(async function() {

    SatelliteMap.app = express()

    SatelliteMap.app.use(bodyParser.json({ limit: '100mb', parameterLimit: 1000000, extended: true }));
    SatelliteMap.app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    SatelliteMap.app.use(express.static(__dirname + '/public'));

    // Connect to MongoDB yiha
    SatelliteMap.mongo = new Promise(function(resolve, reject) {
        SatelliteMap.MongoClient.connect(process.env.MONGO_HOST, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
            if (!error && client.db) {
                resolve(client.db(process.env.MONGO_DB));
            } else {
                reject(error);
            }
        });
    });

    SatelliteMap.mongo.then(async function(client) {
        SatelliteMap.db = client;


        const TLE = require('./App/classes/TLE.js');
        const tle = new TLE();

        const Landsat = require('./App/classes/Landsat.js');
        const landsat = new Landsat();

        // landsat.syncScenes();


        // await tle.getAllSatellites();

        function catchAsyncErrors(fn) {
            return (req, res, next) => {
                const routePromise = fn(req, res, next);
                if (routePromise.catch) {
                    routePromise.catch(err => {
                        next(err)
                    });
                }
            }
        }

        // Load routes dynamicly
        await new Promise(async(resolve, reject) => {
            const route_root = `.\\src\\App\\routes`;
            let table = [];
            for await (const entry of readdirp(route_root, { entryType: 'all', fileFilter: ['*.js'] })) {
                // Skip all files (or folders) that dont include .js in the path
                if (String(entry.path).includes('.js')) {
                    const route = {
                        endpoint: String(entry.path).replace('.js', ''),
                        path: entry.path,
                        fullPath: entry.fullPath
                    };


                    // First check if we the provided JS file executes without any errors
                    const source_file = fs.readFileSync(entry.fullPath);
                    syntaxChecker(source_file, entry.fullPath);

                    const methods = require(`.\\App\\routes\\${route.path}`);
                    for (var i = 0; i < methods.length; i++) {
                        const method = methods[i];

                        // First we create a string that will be the endpoint
                        let path = (method.custom_url || `/${route.endpoint}`);

                        // Add paramters to this method
                        for (var x = 0; x < method.parameters.length; x++) {
                            path += `/:${method.parameters[x]}`;
                        }

                        if (!method.disabled) {
                            // Check if we should use middleware for this method
                            if (method.middleware) {
                                SatelliteMap.app.use(`${path}`, catchAsyncErrors(method.middleware.function));
                            }
                            path = path.replace('\\', '/');
                            path = path.replace('\\', '/');
                            SatelliteMap.app[method.method](`${path}`, catchAsyncErrors(method.request));
                        }
                        table.push({ http_endpoint: path, http_method: method.method, params: method.parameters, enabled: (!method.disabled ? true : false), middleware: (method.middleware.name || false) });
                    }
                }
            }

            console.log('\n\n[SatelliteMap-API] Routers');
            console.table(table);
            resolve(true);
        });

        // Middleware error reporting
        SatelliteMap.app.use((err, req, res, next) => {
            if (!err) return next();

            res.status(err.status || 500).json({ status: err.status, message: err.message })
        });

        SatelliteMap.app.listen(process.env.PORT, () => console.log(`app listening on port ${process.env.PORT}`));
    })
})();