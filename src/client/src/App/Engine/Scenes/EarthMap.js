import Engine from '../../Engine';
import AssetLoader from '../Components/Loaders/AssetLoader';
import CartesianToVector from '../Helpers/Math/CartesianToVector';
import ServerAPI from './SatelliteMapScene/Components/ServerAPI';
const API = Engine.API;
const THREE = API.THREE;

import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'

export default class EarthMap extends API.Components.Scene {

    earthRadius = 6371; // earth radius in km

    assetLoader = new AssetLoader();
    trackedObjects = localStorage.getItem("trackedObjects") || [];
    serverAPI = new ServerAPI();

    constructor() { super() }

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

            // Create earth sphere
            var geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
            var sphere = new THREE.Mesh(geometry, material);
            resolve(sphere);
        })
    }

    onStart = async() => {

        // UI Manager
        const UIManager = API.Components.UI.UIManager;

        // Set the assetLoader base url
        this.assetLoader.setUrl('http://localhost:3002');
        this.assetLoader.setUI(UIManager);



        // Create a new camera and assign it to this scene
        const camera = new API.Components.Cameras.TrackballCamera();
        this.setActiveCamera(camera);

        camera.position = new THREE.Vector3(4.360517114658246, 4.776140059675776, 12.569062580608882)
        camera.rotation = new THREE.Vector3(-0.6286608636793694, 0, 0);
        camera.controls.rotateSpeed = 1;
        camera.controls.noPan = true;
        camera.position.z = 15000;


        this.add(new THREE.AmbientLight(0x333333, 5.5));


        var directionalLight = new THREE.DirectionalLight(new THREE.Color('gray'), 1);
        directionalLight.position.set(0, 0, 0)
        this.add(directionalLight);

        var pointLightHelper = new THREE.PointLightHelper(directionalLight, 100);
        this.add(pointLightHelper);


        const countriesJson = require('./EarthMap/countries.json').features;
        for (let index = 0; index < countriesJson.length; index++) {
            const country = countriesJson[index];
            const coordinates = country.geometry.coordinates;
            let points = [];

            for (let a = 0; a < coordinates.length; a++) {
                const coords = coordinates[a][0];
                for (let x = 0; x < coords.length; x++) {
                    const coord = coords[x];
                    const vector = CartesianToVector([coord[1], coord[0]]);
                    points.push(vector);
                }
            }


            var geometry = new ConvexGeometry(points);
            var material = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: false });
            var mesh = new THREE.Mesh(geometry, material);
            this.add(mesh);
            // break;
        }
        // console.log(countriesJson);

        // // Get all points from the json file
        // let countries = countiesJson.features.filter(item => item.geometry.type === 'Polygon');


        // for (let i = 0; i < countries.length; i++) {
        //     const country = countries[i];
        //     const coords = country.geometry.coordinates[0];
        //     const points = [];
        //     for (let a = 0; a < coords.length; a++) {
        //         const coord = coords[a];




        //         break;
        //         // Create a point array in 3D
        //         const vector = CartesianToVector([coord[1], coord[0]], 100);
        //         points.push(vector);
        //     }

        //     var material = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });
        //     // var geometry = new THREE.BufferGeometry().setFromPoints(points);


        //     //var mesh = new THREE.ConvexGeometry( vertices_array );

        //     var geometry = new ConvexGeometry(points);
        //     var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
        //     var mesh = new THREE.Mesh(geometry, material);
        //     this.add(mesh);


        // }


        // Create earth Sphere
        const earth = await this.earthSphere();
        this.add(earth);


    }
}