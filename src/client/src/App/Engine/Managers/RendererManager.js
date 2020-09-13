import { WebGLRenderer } from 'three';
import Engine from '../../Engine.js';
import { setTimeout } from 'core-js';

class RendererManager {
    renderer = null;
    DevUI = null;

    constructor() {
        if (!RendererManager.instance) { RendererManager.instance = this; }
        return RendererManager.instance;
    }

    startup = () => {
        this.renderer = new WebGLRenderer({ antialias: true });


        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById('renderer').appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);
    }

    onWindowResize = () => {
        const camera = Engine.sceneManager.getActiveScene().getActiveCamera();
        if (camera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

const rendererManagerInstance = new RendererManager();
export default rendererManagerInstance;