import { Scene as ThreeScene, AxesHelper, Object3D } from 'three';

export default class Scene extends ThreeScene {
    sceneCamera = false;
    axesHelper = false;

    constructor() {
        super();

        // Extend some scene functions to support callbacks
        const _add = this.add;
        this.add = function(object) {
            if (object.gameObject) {
                let function_result;

                // We need to copy the all the elements from the original object
                if (typeof arguments[1].tileIndex === 'number') {
                    const obj = new Object3D();
                    obj.onStart = object.gameObject.onStart;
                    obj.onUpdate = object.gameObject.onUpdate;
                    obj.onFixedUpdate = object.gameObject.onFixedUpdate;
                    obj.onDestroy = object.gameObject.onDestroy;

                    if (arguments[1].position) {
                        obj.position.set(arguments[1].position.x, 0, arguments[1].position.y); // We fix this later so it moves to the correct x,y,z position
                    }

                    function_result = _add.apply(this, [obj]);

                    if (arguments && arguments[1]) {
                        obj.onStart({...arguments[1], parent: obj });
                    } else {
                        obj.onStart({});
                    }
                    return function_result;
                }
            } else {
                let function_result = _add.apply(this, arguments);
                if (object.onStart) object.onStart();
                return function_result;
            }
        }



        this.axesHelper = new AxesHelper(1000);
        this.axesHelper.name = "Scene_AxesHelper";
        this.axesHelper.visible = false;

        this.add(this.axesHelper);
    }

    setActiveCamera = (cameraComponent) => {
        this.sceneCamera = cameraComponent;
    }

    getActiveCamera = () => {
        return this.sceneCamera;
    }
}