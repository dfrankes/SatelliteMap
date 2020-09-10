import Engine from '../../Engine';

export default class RenderLoopManager {
    lastFrameTimeMs = 0;
    maxFPS = 90;
    delta = 0;
    timestep = 1000 / 90;
    fps = 90;
    framesThisSecond = 0;
    lastFpsUpdate = 0;
    delay = 0;

    panic = () => {
        this.delta = 0;
    }

    startup = () => {
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop = (timestamp) => {

        this.delay = Math.round(timestamp - this.lastFrameTimeMs);
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFPS)) {
            requestAnimationFrame(this.gameLoop);
            return;
        }
        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        if (timestamp > this.lastFpsUpdate + 1000) {
            this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;

            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond++;

        var numUpdateSteps = 0;
        const rendererManager = Engine.rendererManager;
        const scene = Engine.sceneManager.getActiveScene();
        const camera = scene.sceneCamera;
        while (this.delta >= this.timestep) {
            if (scene && camera) {
                scene.children.forEach(element => {
                    if (element.onFixedUpdate && element.isReady === true) element.onFixedUpdate({ timestamp: timestamp, delta: this.delta, fps: this.fps, lastFpsUpdate: this.lastFpsUpdate, framesThisSecond: this.framesThisSecond });
                });
            }
            this.delta -= this.timestep;
            if (++numUpdateSteps >= 240) {
                this.panic();
                break;
            }
        }

        if (scene && camera) {
            scene.children.forEach(element => {
                if (element.onUpdate && element.isReady === true) element.onUpdate({ timestamp: timestamp, delta: this.delta, fps: this.fps, lastFpsUpdate: this.lastFpsUpdate, framesThisSecond: this.framesThisSecond });
            });


            if (camera.controls && camera.controls.update)
                camera.controls.update();

            rendererManager.renderer.render(scene, camera);
        }

        requestAnimationFrame(this.gameLoop);
    }
}