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
globalThis.axios = require('axios');

import SatelliteMapScene from './App/Engine/Scenes/SatelliteMapScene';
import LoadingScene from './App/Engine/Scenes/LoadingScene';

import Engine from './App/Engine.js';
Engine.startup({ scene: LoadingScene });
window.EngineInstance = Engine;