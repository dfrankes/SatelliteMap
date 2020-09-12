path = require('path');
fs = require('fs');
glob = require("glob");
_ = require('underscore');
express = require('express');
bodyParser = require('body-parser');
readdirp = require('readdirp');
moment = require('moment');
axios = require('axios');

syntaxChecker = require('syntax-error');
Random = require('meteor-random');
require('dotenv').config({ path: '.\\src\\.env' });

SatelliteMap = {}
SatelliteMap.mongo = null;
SatelliteMap.db = null;
SatelliteMap.MongoClient = require('mongodb').MongoClient;
SatelliteMap.settings = require('./config/settings.json');
SatelliteMap.helpers = require('./helpers/default.js');


// Load this automaticly into an array for use in the routers
SatelliteMap.middleware = [];
SatelliteMap.middleware['access_key'] = require('./middleware/access_key.js');