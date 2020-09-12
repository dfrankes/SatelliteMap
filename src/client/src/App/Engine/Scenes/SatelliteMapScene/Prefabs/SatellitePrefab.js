import Component from '../../../Components/Component';
import CartesianToVector from '../../../Helpers/Math/CartesianToVector';
import { Color, SphereGeometry, MeshBasicMaterial, Mesh, BufferGeometry, Line, Vector3 } from 'three';
const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");

export default class SatellitePrefab extends Component {

    satelliteName;
    satelliteId;
    tle = [];
    info;
    date = new Date();

    constructor(satelliteInfo) {
        super();


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


    }


    onStart = () => {

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
    }


    onFixedUpdate = () => {

    }
}