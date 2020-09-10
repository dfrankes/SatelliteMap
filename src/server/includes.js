express = require('express');
THREE = require('three');


Engine = {};
Engine.version = '0.1.1';
Engine.http_server = require('http').createServer();
Engine.socket_server = require('socket.io')(Engine.http_server);
Engine.express_app = express()

Engine.socket_port = 3000;
Engine.express_port = 8080;