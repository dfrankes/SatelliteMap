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

export default class SatelliteMapScene extends API.Components.Scene {
    constructor() { super() }

    assetLoader = new AssetLoader();
    earthRadis = 6371; // Radius in KM

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

            // Wait 1500ms
            await new Promise(resolve => setTimeout(resolve, 1500));

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
        this.assetLoader.setUrl('http://localhost:8080');


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


        // Orbit Prediction code
        // POC
        //


        // Create a 24 hour period with a 10 second interval
        const total = 24 * 60 * 60 / 10;
        const nowMinusTen = new Date();
        nowMinusTen.setSeconds(nowMinusTen.getSeconds() - 10);

        const timeArray = [nowMinusTen];
        const orbitLocations = [];


        // Calculate orbit for satellite / space object
        // Satellite info
        const period = 102.10;
        const totalPredictions = period * 60 / 10;
        const tle = [
            'METEOR M2',
            '1 40069U 14037A   20253.56524684 -.00000019  00000-0  10662-4 0  9996',
            '2 40069  98.4965 287.8947 0006598  46.3602 313.8126 14.20675077320150'
        ];

        for (let i = 0; i <= totalPredictions * 2; i++) {
            const date = timeArray[i - 1] ? new Date(timeArray[i - 1]) : new Date();
            date.setSeconds(date.getSeconds() + 10);

            const latLonObj = getLatLngObj(tle, date.getTime());
            const info = getSatelliteInfo(tle, date.getTime());
            const vector = CartesianToVector([latLonObj.lat, latLonObj.lng], info.height);
            orbitLocations.push({
                latLonObj,
                info,
                vector,
            })

            timeArray.push(date);
        }


        // Create points
        const orbitPoints = [];
        for (let i = 0; i < orbitLocations.length; i++) {
            orbitPoints.push(orbitLocations[i].vector);
        }
        var geometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

        var line = new THREE.Line(geometry, material);
        this.add(line);


        // Add satellite to map
        //
        const latLonObj = getLatLngObj(tle);
        const info = getSatelliteInfo(tle);


        const ISS = CartesianToVector([latLonObj.lat, latLonObj.lng], info.height);
        var geometry = new THREE.SphereGeometry(25, 20, 20);
        var material = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = ISS.x;
        mesh.position.z = ISS.z;
        mesh.position.y = ISS.y;


        var points = [];
        points.push(ISS);
        points.push(new THREE.Vector3(0, 0, 0));

        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var line = new THREE.Line(geometry, material);
        this.add(line);

        // Add satellite
        this.add(mesh);

        // Add text
        let sprite = new SpriteText2D("METEOR M2", { align: textAlign.left, font: '20px Arial', fillStyle: '#ffffff', antialias: true, strokeStyle: '#000000' })
        sprite.scale.set(5, 5, 5);

        sprite.material.alphaTest = .1
        this.add(sprite);


        // Update Satalite location every 1000ms
        // This will be done dynamicly later (so you can track multple satellite or other objects)
        setInterval(() => {
            const latLonObj = getLatLngObj(tle);
            const info = getSatelliteInfo(tle);

            let loc = CartesianToVector([latLonObj.lat, latLonObj.lng], info.height);
            mesh.position.x = loc.x;
            mesh.position.z = loc.z;
            mesh.position.y = loc.y;

            sprite.position.set(mesh.position.x + 75, mesh.position.y + 75, mesh.position.z + 75);
            sprite.text = `METEOR M2
        - lat: ${latLonObj.lat}
        - lng: ${latLonObj.lng}
        - azimuth: ${info.azimuth}
        - velocity (km/s): ${info.velocity}
        - height (km): ${info.height}
        `
            line.geometry = new THREE.BufferGeometry().setFromPoints([loc, new THREE.Vector3(0, 0, 0)]);

        }, 1000);
    }
}