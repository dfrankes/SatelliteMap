/**
 * //TODO
 * A lot of code inside this file and the SatelliteMapScene folder will be replaced in the future.
 * Cleanup the managers, Make earth into its own component etc etc
 * implement the AssetLoader into the new UI (looks way better), or maby make the whole ui based on "dynamic tabs"?
 */

import Engine from '../../Engine';
const API = Engine.API;
const THREE = API.THREE;

const Vector3 = API.THREE.Vector3;
const PointLight = API.THREE.PointLight;


import CartesianToVector from '../Helpers/Math/CartesianToVector';
import { MeshText2D, SpriteText2D, textAlign } from 'three-text2d'
const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");

import AssetLoader from '../Components/Loaders/AssetLoader';
import _ from 'underscore';
import Component from '../Components/Component';


import Handlebars from 'handlebars';
import Navigator from './SatelliteMapScene/Modules/Navigator';

export default class SatelliteMapScene extends API.Components.Scene {
    constructor() { super() }

    assetLoader = new AssetLoader();
    earthRadis = 6371; // Radius in KM
    trackedObjects = localStorage.getItem("trackedObjects") || [];


    earthSphere = async() => {
        return await new Promise(async resolve => {
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

            // Destroy the panel
            this.assetLoader.destroy();

            // Create earth sphere
            var geometry = new THREE.SphereGeometry(this.earthRadis, 64, 64);
            var sphere = new THREE.Mesh(geometry, material);


            resolve(sphere);
        })
    }

    onStart = async() => {
        // Set the assetLoader base url
        this.assetLoader.setUrl('http://localhost:3002');


        // Create a new camera and assign it to this scene
        const camera = new API.Components.Cameras.TrackballCamera();
        this.setActiveCamera(camera);

        camera.position = new Vector3(4.360517114658246, 4.776140059675776, 12.569062580608882)
        camera.rotation = new Vector3(-0.6286608636793694, 0, 0);
        camera.controls.rotateSpeed = 1;
        camera.controls.noPan = true;
        camera.position.z = 15000;


        var light = new PointLight(0xffffff, 10, 100);
        light.position.set(0, 5, 0);
        this.add(light);

        var pointLightHelper = new API.THREE.PointLightHelper(light, 1);
        this.add(pointLightHelper);
        this.add(new THREE.AmbientLight(0x333333, 5.5));


        // Create earth Sphere
        const earth = await this.earthSphere();
        this.add(earth);


        var directionalLight = new THREE.DirectionalLight(new THREE.Color('gray'), 0.5);
        this.add(directionalLight);



        // Setup the menu
        const navigator = new Navigator(this);
    }
}