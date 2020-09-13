import Component from '../../../Components/Component';
import CartesianToVector from '../../../Helpers/Math/CartesianToVector';
import { Color, SphereGeometry, MeshBasicMaterial, Mesh, BufferGeometry, Line, Vector3, LogLuvEncoding } from 'three';
const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");
import API from '../../../API';
import engineInstance from '../../../../Engine';

export default class SatellitePrefab extends Component {

    satelliteName;
    satelliteId;
    tle = [];
    info;
    date = new Date();

    constructor(satelliteInfo) {
        super();

        if (typeof satelliteInfo.info !== "object") return;


        this.satelliteName = satelliteInfo.name;
        this.satelliteId = satelliteInfo.satelliteId;
        this.tle = [
            this.satelliteName,
            satelliteInfo.lines[0],
            satelliteInfo.lines[1],
        ]


        this.info = getSatelliteInfo(this.tle);

        this.info = satelliteInfo.info;
        this.locationImage = null;


        this.name = this.satelliteName;
        this.type = 'satellite';
        this.satelliteInfo = satelliteInfo;


        this.randomBodyId = Math.random().toString(36).substring(7); // this is stupid....
    }


    onStart = () => {

        if (typeof this.info !== "object") return;

        // Calculate the current loaction in 3D space
        const vector = CartesianToVector([this.info.lat, this.info.lng], this.info.height);


        // Create object
        this.geometry = new SphereGeometry(25, 20, 20);
        this.material = new MeshBasicMaterial({ color: new Color('red') });
        this.mesh = new Mesh(this.geometry, this.material);

        this.mesh.position.x = vector.x;
        this.mesh.position.z = vector.z;
        this.mesh.position.y = vector.y;

        this.add(this.mesh);


        const geometry = new BufferGeometry().setFromPoints([]);
        this.pointer = new Line(geometry, this.material);
        this.add(this.pointer);


        this.fixedLoop = setInterval(() => {
            // Calculate new position
            this.info = getSatelliteInfo(this.tle);

            const vector = CartesianToVector([this.info.lat, this.info.lng], this.info.height);
            this.mesh.position.x = vector.x;
            this.mesh.position.z = vector.z;
            this.mesh.position.y = vector.y;


            this.pointer.geometry = new BufferGeometry().setFromPoints([this.mesh.position, new Vector3(0, 0, 0)]);
        }, 1000);

        // const activeScene = API.Managers.SceneManager.getActiveScene();
        // activeScene.trackedObjects.push(this);

    }


    onFixedUpdate = (data) => {
        if (this.follow) {
            const activeScene = engineInstance.sceneManager.getActiveScene();
            const activeCamera = activeScene.getActiveCamera();


            const vector = CartesianToVector([this.info.lat, this.info.lng], this.info.height + 1500);

            activeCamera.controls.target.set(0, 0, 0)

            activeCamera.position.x = vector.x;
            activeCamera.position.y = vector.y;
            activeCamera.position.z = vector.z;
        }
    }
}