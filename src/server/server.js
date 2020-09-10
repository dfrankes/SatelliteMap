/**
 * 3DEngine - Core File
 */
require('./includes.js');

(async function() {

    Engine.http_server.listen(Engine.socket_port, () => console.log(`Socket.io server running at http://127.0.0.1:${Engine.socket_port}`));
    Engine.express_app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    Engine.express_app.use(express.static(__dirname + '/public'));
    Engine.express_app.listen(Engine.express_port, () => console.log(`Assets server running at http://127.0.0.1:${Engine.express_port}`));
})();