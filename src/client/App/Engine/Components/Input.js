import KeyCode from '../Enumerators/Input.keyCode';
import Engine from '../../Engine';
class Input {

    inputs = {}
    KeyCode = KeyCode;

    constructor() {
        if (!Input.instance) {
            Input.instance = this;
        }
        return Input.instance;
    }

    setupEventListeners = () => {
        this.clearInputs();
        let domRoot = Engine.rendererManager.renderer.domElement;

        domRoot.addEventListener('mousedown', (event) => {
            this.inputs.mouse.state = KeyCode.DOWN;
            this.lastEvent = event
        }, false);
        domRoot.addEventListener('mouseup', (event) => {
            this.inputs.mouse.state = KeyCode.UP;
            this.lastEvent = event
        }, false);
        domRoot.addEventListener('keydown', (event) => {
            this.inputs.keyboard[event.which] = KeyCode.DOWN;
            this.lastEvent = event
        }, false);
        domRoot.addEventListener('keyup', (event) => {
            this.inputs.keyboard[event.which] = KeyCode.UP;
            this.lastEvent = event
        }, false);
    }


    clearInputs = () => {
        this.inputs = {
            mouse: { state: false },
            keyboard: {}
        }
    }

    mouseDown = () => this.inputs.mouse.state === KeyCode.DOWN;
    mouseUp = () => !this.inputs.mouse.down === KeyCode.UP;
    keyDown = (key) => this.inputs.keyboard[key] && this.inputs.keyboard[key] === KeyCode.DOWN ? true : false
}

const inputInstance = new Input();
export default inputInstance;