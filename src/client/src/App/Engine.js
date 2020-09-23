import API from './Engine/API';
class Engine {

    uuid = API.Helpers.uuidv4();
    sceneManager = API.Managers.SceneManager;
    rendererManager = API.Managers.RendererManager;
    renderLoopManager = new API.Managers.RenderLoopManager();
    API = API;

    constructor() {
        if (!Engine.instance) {
            Engine.instance = this;
        }
        return Engine.instance;
    }

    startup = ({ scene }) => {
        this.rendererManager.startup();

        this.API.Components.Input.setupEventListeners();

        this.sceneManager.startup();
        this.renderLoopManager.startup();

        // Load scene
        this.sceneManager.loadScene(scene);
    }
}

const engineInstance = new Engine();
export default engineInstance;