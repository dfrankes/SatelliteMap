class SceneManager {
    DevUI = null;
    scenes = [];
    activeScene = { uuid: "" };

    constructor() {
        if (!SceneManager.instance) { SceneManager.instance = this; }
        return SceneManager.instance;
    }

    startup = () => {

    }

    loadScene = (scene) => {
        this.activeScene = new scene();
        this.scenes.push(this.activeScene);
        this.activeScene.onStart();
    }

    unLoadScene = () => {

    }

    getActiveScene = () => {
        return this.activeScene;
    }
}

const SceneManagerInstance = new SceneManager();
export default SceneManagerInstance;