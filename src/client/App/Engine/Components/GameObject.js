const { v4: uuidv4 } = require('uuid');
import { AxesHelper } from 'three';
import EngineLayers from '../Enumerators/EngineLayers';

export default class GameObject {
    // GameObject Variables

    uuid = uuidv4() // Create a UUID for this object
    gameObject = {}; // The main gameObject reference (threeJS)
    geometry = {}; // gameObject geometry
    material = {}; // gameObject material
    layer = null; // Defines the layer the object is in (for example, ignoreRaycast, ignoreCamera)


    // GameObject functions
    onStart = false; // When the component get initialized
    onUpdate = false; // Run every tick
    onFixedUpdate = false; // Runs on a fix tickRate
    onDestroy = false; // Runs when the components has been destroyed

    // Dev Tools
    axesHelper = false;

    constructor() {
        this.axesHelper = new AxesHelper(1000);
        this.axesHelper.name = "GameObject_AxesHelper";
        this.axesHelper.visible = true;

        this.layer = EngineLayers.default;
    }
}