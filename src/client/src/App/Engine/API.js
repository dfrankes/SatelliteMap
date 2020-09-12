import SceneManager from './Managers/SceneManager';
import RendererManager from './Managers/RendererManager';
import RenderLoopManager from './Managers/RenderLoopManager';
import * as dat from 'dat.gui';
import * as THREE from 'three';

import UI from './Components/UI';
import Input from './Components/Input';

import { Vector3, GridHelper } from 'three';
import { AmbientLight, PointLight } from 'three';


import EngineLayers from "./Enumerators/EngineLayers";
import InputKeyCode from './Enumerators/Input.keyCode';

// Import UI Elements
import Panel from './Components/UI/Elements/Panel';
import DefaultCamera from './Components/Cameras/DefaultCamera';
import TrackballCamera from './Components/Cameras/TrackballCamera';

import AssetLoader from './Components/Loaders/AssetLoader';

class API {

    constructor() {
        if (!API.instance) {
            API.instance = this;
        }
        return API.instance;
    }

    // Engine Components
    Components = {
        UI: {
            UIManager: UI,
            Elements: {
                Panel
            },
            dat
        },
        Input: Input,
        Scene: require('./Components/Scene').default,
        Cameras: {
            DefaultCamera,
            TrackballCamera
        },
        Loaders: {
            AssetLoader
        },
        Game: {}
    }

    Managers = {
        SceneManager,
        RendererManager,
        RenderLoopManager
    }

    Helpers = {
        uuidv4: require('uuid')
    }

    Enumerators = {
        EngineLayers,
        KeyCode: InputKeyCode
    }

    // Still need to place these in a group
    THREE = THREE;
}

const apiInstance = new API();
export default apiInstance;