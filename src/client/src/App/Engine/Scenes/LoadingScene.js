import Engine from '../../Engine';
const API = Engine.API;
const THREE = API.THREE;

const Vector3 = API.THREE.Vector3;

import _ from 'underscore';

import ServerAPI from './SatelliteMapScene/Components/ServerAPI';
import AssetLoader from '../Components/Loaders/AssetLoader';
import SatellitePrefab from './SatelliteMapScene/Prefabs/SatellitePrefab';

import {MeshBasicMaterial, Color, SphereGeometry, Mesh} from 'three';
import CartesianToVector from '../../Engine/Helpers/Math/CartesianToVector';
const { getLatLngObj, getSatelliteInfo } = require("tle.js/dist/tlejs.cjs");

export default class LoadingScene extends API.Components.Scene {
    constructor() { super() }

    assetLoader = new AssetLoader();
    earthRadis = 6371; // Radius in KM
    satelliteCount = 0;
    database = [];


    earthSphere = async() => {
        return await new Promise(async resolve => {
            const textures = await this.assetLoader.loadTextures([
                { name: 'earth_map', url: '/textures/world_shaded_16k.jpg' },
                { name: 'earth_bumpMap', url: '/textures/pprkbSq.jpg' },
                { name: 'earth_specularMap', url: '/textures/d9GrpXR.png' }
            ], true);

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
    }


    onStart = async() => {
        let loaderDiv = $('.loaderDiv')[0]; $('.loaderDiv').removeClass('d-none');


        loaderDiv.innerHTML = 'Loading satellites from database....';

        let api = new ServerAPI();
        const getCount = await api.request('get', 'searchAll?returnCount=true');
        if(getCount.status !== 200){
            loaderDiv.innerHTML = 'API offline, please try again later...'; return;
        }
        this.satelliteCount = Number(getCount.data);
        
        loaderDiv.innerHTML = `Found ${this.satelliteCount} satellites in database, downloading data...`;
        const database = await api.request('get', 'searchAll');
        if(database.status !== 200){
            loaderDiv.innerHTML = 'API offline, please try again later...'; return;
        }
        this.database = database.data;
        loaderDiv.innerHTML = `Database downloaded, parsing data...`;

        $('.toggleSettings').on('click', () => {
            $('#settingsPanel').toggleClass('d-none');
        })

        this.assetLoader.setUrl(`http://api.${window.location.hostname}`);
        this.assetLoader.setUI($('.loaderDiv')[0]);

        // Load the earthSphere
        const earth = await this.earthSphere();

        loaderDiv.innerHTML = `Textures downloaded, creating scene..`;

        this.add(earth);

        this.background = new THREE.Color( /*0x212529*/0x000000 );

        // Create a new camera and assign it to this scene
        const camera = new API.Components.Cameras.TrackballCamera();
        this.setActiveCamera(camera);

        camera.position = new Vector3(4.360517114658246, 4.776140059675776, 12.569062580608882)
        camera.rotation = new Vector3(-0.6286608636793694, 0, 0);
        camera.controls.rotateSpeed = 1;
        camera.controls.noPan = true;
        camera.position.z = 15000;

        this.add(new THREE.AmbientLight(0x333333, 5.5));

        var directionalLight = new THREE.DirectionalLight(new THREE.Color('gray'), 1);
        directionalLight.position.set(0, 0, 0)
        this.add(directionalLight);



        // Load all satellite objects
        var geom = new THREE.Geometry();
        let processed = 0;


        let mesh;
        const dummy = new THREE.Object3D();
        let geometry = new SphereGeometry(50, 20, 20);
        let material = new MeshBasicMaterial({ color: new Color('red'), wireframe: false });

        
        mesh = new THREE.InstancedMesh( geometry, material, this.database.length );
        mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.add(mesh);

        /** Add the moon */
        let moonTLE = [
            'MOON',
            '1 00000U 00000    16179.56434792  .00000000  00000-0  10000-3 0 00001',
            '2 00000 018.4553 004.0484 0463000 029.4136 333.1953 00.03660099000006'
        ]
        let moonPos = getSatelliteInfo(moonTLE);
        const vector = CartesianToVector([moonPos.lat, moonPos.lng], moonPos.height);

        console.log(moonPos.height / 10);

        let geometryMoon = new SphereGeometry(1737, 20, 20);
        let materialMoon = new MeshBasicMaterial({ color: new Color('white'), wireframe: false });
        let meshMoon = new THREE.Mesh( geometryMoon, materialMoon);

        meshMoon.position.x = vector.x;
        meshMoon.position.y = vector.y;
        meshMoon.position.z = vector.z;

        this.add(meshMoon);

        console.log("hello world");

        /**Add the sun */
        let SunTLE = [
            'SUN',
            '1 00001U 00  0  0 95080.09236111  .00000000  00000-0  00000-0 0  0017',
            '2 00001 023.4400 000.0000 0000000 282.8700 075.2803 00.00273790930019'
        ]
        let SunPos = getSatelliteInfo(SunTLE);
        const vectorr = CartesianToVector([SunPos.lat, SunPos.lng], SunPos.height / 5);

        let geometrySun = new SphereGeometry(1737, 20, 20);
        let materialSun = new MeshBasicMaterial({ color: new Color('yellow'), wireframe: false });
        let meshSun = new THREE.Mesh( geometrySun, materialSun);

        meshSun.position.x = vectorr.x;
        meshSun.position.y = vectorr.y;
        meshSun.position.z = vectorr.z;

        this.add(meshSun);

        for (let index = 0; index < this.database.length; index++) {
            const object = this.database[index];
    
            const scene = Engine.sceneManager.getActiveScene();
            const satelliteObject = _.findWhere(scene.children, { satelliteId: object.satelliteId });
            if(!satelliteObject){
                try {
                    let tle = [
                        object.name,
                        object.lines[0],
                        object.lines[1],
                    ]
            
                    let info = getSatelliteInfo(tle);
                    const vector = CartesianToVector([info.lat, info.lng], info.height);

                    dummy.position.x = vector.x;
                    dummy.position.z = vector.z;
                    dummy.position.y = vector.y;

                    dummy.rotation.y = ( Math.sin( dummy.position.x / 4 + 0 ) + Math.sin( dummy.position.y / 4 + 0 ) + Math.sin( dummy.position.z / 4 + 0 ) );
 
                    dummy.updateMatrix();
                    mesh.setMatrixAt( index, dummy.matrix );
                } catch (error) {
                    
                }
            }
        }

        mesh.instanceMatrix.needsUpdate = true;
        mesh.visible = false;

        $('#toggleSet').on('click', (event) => {
            const target = $(event.target).closest('button');
            const set = target.data('set');
            
            $('#toggleSet').removeClass('btn-success');
            switch(set){
                case 'ALL':
                    mesh.visible = !mesh.visible

                    if(!mesh.visible){
                        target.removeClass('btn-success');
                    }else{
                        target.addClass('btn-success');
                    }
                    
                break;
            }
        })


        $('.loaderDiv').addClass('d-none')
    }
}