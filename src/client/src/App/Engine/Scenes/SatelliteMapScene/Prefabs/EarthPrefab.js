import Component from '../../../Components/Component';
import CartesianToVector from '../../../Helpers/Math/CartesianToVector';
import { Color, SphereGeometry, MeshBasicMaterial, Mesh, BufferGeometry, Line, Vector3, LogLuvEncoding, PlaneGeometry, DoubleSide, MeshPhongMaterial } from 'three';
const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");
import API from '../../../API';
import engineInstance from '../../../../Engine';
import { Matrix4, Quaternion } from 'three/build/three.module';


import AssetLoader from '../../../Components/Loaders/AssetLoader';
export default class EarthPrefab extends Component {

    assetLoader = new AssetLoader();

    constructor(satelliteInfo) {
        super();

    }

    onStart = async() => {

        const earth = await new Promise(async resolve => {
            const textures = await this.assetLoader.loadTextures([
                { name: 'earth_map', url: '/textures/world_shaded_16k.jpg' },
                { name: 'earth_bumpMap', url: '/textures/pprkbSq.jpg' },
                { name: 'earth_specularMap', url: '/textures/d9GrpXR.png' }
            ], false);

            const material = await new Promise(resolve => {
                resolve(new THREE.MeshPhongMaterial({
                    wireframe: false,
                    map: _.findWhere(textures, { name: 'earth_map' }).texture,
                    bumpMap: _.findWhere(textures, { name: 'earth_bumpMap' }).texture,
                    bumpScale: 1000,
                    specularMap: _.findWhere(textures, { name: 'earth_specularMap' }).texture,
                    specular: new THREE.Color('grey')
                }))
            })

            // Create earth sphere
            var geometry = new THREE.SphereGeometry(this.earthRadis, 64, 64);
            var sphere = new THREE.Mesh(geometry, material);
            resolve(sphere);
        })

        this.add(earth);
    }
}