import { Object3D } from "three/build/three.module";
import EngineLayers from '../Enumerators/EngineLayers';
export default class Component extends Object3D {

    // Component functions
    onStart = false; // When the component get initialized
    onUpdate = false; // Run every tick
    onFixedUpdate = false; // Runs on a fix tickRate
    onDestroy = false; // Runs when the components has been destroyed

    constructor() {
        super();

        this.layer = EngineLayers.ignoreRaycast; // By default we disable raycasts
        this.isReady = true;
    }
}