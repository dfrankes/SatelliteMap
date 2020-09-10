globalThis.EngineInstance = {};

import './stylesheets/Engine.css'
import 'bootstrap';

import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'


import * as dat from 'dat.gui';
import _ from 'underscore';
globalThis._ = _;
globalThis.uuid = require('uuidv4');
globalThis.dat = dat;


import SatelliteMapScene from './App/Engine/Scenes/SatelliteMapScene';

import Engine from './App/Engine.js';
Engine.startup({ scene: SatelliteMapScene });