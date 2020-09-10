import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Engine from '../../../Engine';

export default class DefaultCamera {

    constructor(fov = 70, aspect = window.innerWidth / window.innerHeight, near = 0.01, far = 10000000) {
        _.extend(this, new PerspectiveCamera());

        this.name = "SceneCamera";
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.update();
        this.enableMovement();

        this.name = this.name || this.type;
        return this;
    }

    enableMovement = () => this.movment(true);
    movment = (enabled = true) => {
        if (!this.controls) this.controls = new OrbitControls(this, Engine.rendererManager.renderer.domElement);
        this.controls.enabled = enabled;
    }

    update = () => {
        this.needsUpdate = true;
        this.updateMatrix();
        this.updateMatrixWorld();
        this.updateProjectionMatrix();
        this.updateWorldMatrix();
    }
}