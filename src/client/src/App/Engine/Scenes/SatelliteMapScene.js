import Engine from '../../Engine';
const API = Engine.API;
const THREE = API.THREE;

const Vector3 = API.THREE.Vector3;

import AssetLoader from '../Components/Loaders/AssetLoader';
import _ from 'underscore';

import Tab from '../Components/UI/Tab';
import SatellitePrefab from './SatelliteMapScene/Prefabs/SatellitePrefab';
import engineInstance from '../../Engine';

import ServerAPI from './SatelliteMapScene/Components/ServerAPI';

export default class SatelliteMapScene extends API.Components.Scene {
    constructor() { super() }

    assetLoader = new AssetLoader();
    earthRadis = 6371; // Radius in KM
    trackedObjects = localStorage.getItem("trackedObjects") || [];
    serverAPI = new ServerAPI();

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
        // Load from localStorage
        this.trackedItems = JSON.parse(localStorage.getItem("trackedObjects")) || [];

        const UIManager = API.Components.UI.UIManager;


        this.SearchTab = new Tab({
            tabTitle: '<input type="text" placeholder="STARLINK-" class="form-control d-none" style="height: 25px;" id="searchInput"/>',
            tabTitleClass: 'table-wrapper',
            tabContent: false,
            tabHeaderEvents: {
                'input #searchInput': (event) => {
                    setTimeout(async() => {
                        const value = jQuery(event.target).val();
                        const $table = jQuery('#table').bootstrapTable();

                        if (value === "") {
                            let trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
                            $("#jsGrid").jsGrid("loadData");
                            return;
                        }
                        $("#jsGrid").jsGrid("search", value);
                    }, 1000)
                }
            }
        });
        this.TrackingTab = new Tab({
            tabTitle: '<i class="fas fa-satellite"></i> Satellite Tracking',
            tabTitleClass: '',
            tabContent: 'Hello World',
            onActiveChangeEvent: (isActive) => {
                if (isActive) {
                    jQuery('#searchInput').removeClass('d-none');
                    return;
                }
                jQuery('#searchInput').addClass('d-none');
            },
            tabScript: function(tab) {
                const activeScene = engineInstance.sceneManager.getActiveScene();

                //const table = jQuery('<table id="table" class="table" data-search="false" data-toggle="table"></table>');
                const table = jQuery('<div id="jsGrid"></div>');
                tab.tabContent.html(table);


                // Create custom table fields
                var ActionsField = function(config) { jsGrid.Field.call(this, config) };
                ActionsField.prototype = new jsGrid.Field({
                    itemTemplate: function(value, row) {

                        const isEnabled = row.enabled || false;
                        const isFollowing = row.following || false;
                        const isSatelliteStored = (satId => {
                            return _.findWhere(activeScene.trackedItems, {_id: satId}) ? true : false;
                        });

                        const buttons = [
                            {
                                isEnabled: !isEnabled,
                                html: `<button class="btn btn-sm float-right btn-danger mr-1"><i class="fa fa-minus"></i> Remove</button>`
                            },
                            {
                                isEnabled: true,
                                html: `<button class="btn btn-sm float-right btn-${row.enabled ? 'danger' : 'success'} mr-1"><i class="fa fa-${row.enabled ? 'minus' : 'check'}"></i> ${row.enabled ? 'Disable' : 'Enable'}</button>`,
                                onClick: (event) => {
                                    row.enabled = !isEnabled;

                                    const scene = engineInstance.sceneManager.getActiveScene();
                                    const satelliteObject = _.findWhere(scene.children, { satelliteId: row.satelliteId });

                                    if(!isSatelliteStored(row.satelliteId)){
                                        activeScene.trackedItems = [...activeScene.trackedItems, row];
                                        localStorage.setItem("trackedObjects", JSON.stringify(activeScene.trackedItems))
                                    }

                                    if (!satelliteObject) {
                                        const satellite = new SatellitePrefab(row);
                                        scene.add(satellite);
                                    } else {
                                        row.following = false;
                                        scene.remove(satelliteObject);
                                    }

                                    $('#jsGrid').jsGrid('refresh');
                                }
                            },
                            {
                                isEnabled: isEnabled,
                                html: `<button class="btn btn-sm btn-${isFollowing ? 'danger' : 'success'} mr-1"><i class="fa fa-${isFollowing ? 'minus' : 'check'}"></i> ${isFollowing ? 'Unfollow' : 'Follow'}</button>`,
                                onClick: (event) => {
                                    row.following = !isFollowing;

                                    const scene = engineInstance.sceneManager.getActiveScene();

                                    // Disable follows for all objects
                                    const allSatellites = _.filter(scene.children, (child) => child.type === 'satellite');
                                    allSatellites.forEach(item => item.following = false);

                                    const satelliteObject = _.findWhere(scene.children, { satelliteId: row.satelliteId });
                                    if (satelliteObject && !isFollowing) {
                                        satelliteObject.following = true;
                                    } else {
                                        satelliteObject.following = false;
                                    }

                                    $('#jsGrid').jsGrid('refresh');
                                }
                            }
                        ]

                        const $actions = jQuery('<div></div>');
                        buttons.forEach(button => {
                            if (!button.isEnabled) return;

                            const $button = jQuery(button.html).on('click', button.onClick);
                            $actions.append($button);
                        })
                        return $actions;
                    },
                });
                jsGrid.fields.actions = ActionsField;

                $("#jsGrid").jsGrid({
                    width: "100%",
                    height: '400px',
                    inserting: false,
                    editing: false,
                    sorting: false,
                    paging: false,

                    // data: activeScene.trackedItems,
                    autoload: true,
                    controller: {
                        loadData: function (filter = false) {

                            if(filter === "" || Object.keys(filter).length === 0){
                                return activeScene.trackedItems;
                            }

                            return new Promise(async resolve => {
                                let api = new ServerAPI();
                                const request = await api.request('post', 'search', { query: filter });
                                let data = request.data.results;

                                resolve([...activeScene.trackedItems, ...data])
                            })
                        }
                    },
                    fields: [
                        { name: "satelliteId", title: 'Norad ID', type: "text", width: 50 },
                        { name: "name", title: 'Name', type: "text", width: 100 },
                        { name: "info.lat", title: 'Latitude', type: "text", width: 150 },
                        { name: "info.lng", title: 'Longitude', type: "text", width: 150 },
                        { name: "info.velocity", title: 'Velocity', type: "text", width: 150 },
                        { type: "actions", width: 250 },
                    ]
                });


                return;

                $('#table').bootstrapTable({
                    data: activeScene.trackedItems,
                    defaultViewByClick: true,
                    uniqueId: "satelliteId",
                    columns: [{
                            field: 'satelliteId',
                            'title': 'ID',
                        },
                        {
                            'field': 'name',
                            'title': 'Name'
                        },
                        {
                            field: "info.lat",
                            title: "Latitude",
                            formatter: (value, row, index, id) => {
                                return Number(value).toFixed(5) + '°';
                            }
                        },
                        {
                            field: "info.lng",
                            title: "Longitude",
                            formatter: (value, row, index, id) => {
                                return Number(value).toFixed(5) + '°';
                            }
                        },
                        {
                            field: "info.velocity",
                            title: "Velocity",
                            formatter: (value, row, index, id) => {
                                return Number(value).toFixed(2) + ' km/s';
                            }
                        },
                        {
                            'field': 'actions',
                            'title': '',
                            clickToSelect: false,
                            formatter: (value, row, index) => {

                                const trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
                                const tracking = _.findWhere(trackedObjects, { _id: row._id });
                                if (tracking) {
                                    const scene = engineInstance.sceneManager.getActiveScene();
                                    const satelliteObject = _.findWhere(scene.children, { satelliteId: row.satelliteId });

                                    let htmlElements = [
                                        '<div class="float-right">',
                                        `<button class="btn btn-sm btn-${satelliteObject ? 'danger' : 'primary'} mr-1" id="enableSatellite"><i class="fa fa-check"></i> ${satelliteObject ? 'Disable' : 'Enable'}</button>`,
                                    ];
                                    if (satelliteObject) {
                                        htmlElements.push(
                                            `<button class="btn btn-sm btn-${satelliteObject && satelliteObject.follow && row.follow ? 'danger' : 'primary'} mr-1" id="${satelliteObject && satelliteObject.follow && row.follow ? 'unfollowSatellite' : 'followSatellite'}"><i class="fa fa-${satelliteObject && satelliteObject.follow && row.follow ? 'minus' : 'plus'}"></i> Follow</button>`,
                                            '<button class="btn btn-sm btn-primary mr-1" id="showOrbitObject"><i class="fa fa-plus"></i> Show Orbit</button>',
                                        )
                                    }
                                    htmlElements.push('<button class="btn btn-sm btn-danger mr-1" id="removeSattelite"><i class="fa fa-minus"></i> Remove</button>')
                                    return htmlElements.join('');
                                }
                                return [
                                    '<button class="btn btn-sm btn-primary" id="addSatelliteBtn"><i class="fa fa-plus"></i> Track Object</button>',
                                ].join('')
                            },
                            events: {
                                'click #enableSatellite': (event, value, row, index) => {

                                    jQuery(event.target).html('<img src="https://i.imgur.com/KV8Y5DU.gif" width="16"> Loading...')


                                    const scene = engineInstance.sceneManager.getActiveScene();
                                    const satelliteObject = _.findWhere(scene.children, { satelliteId: row.satelliteId });
                                    if (!satelliteObject) {
                                        const satellite = new SatellitePrefab(row);
                                        scene.add(satellite);
                                        return;
                                    }
                                    scene.remove(satelliteObject);
                                },
                                'click #addSatelliteBtn': (event, value, row, index) => {
                                    // Remove from the search results, so we can add it later.btn-primary

                                    $('#table').bootstrapTable('remove', { field: '$index', values: [index] });
                                    $('#table').bootstrapTable('refreshOptions', {
                                        showColumns: false,
                                        search: false,
                                        showRefresh: false,
                                    });

                                    // Add object to our trackedObjectsList
                                    let trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
                                    trackedObjects.push(row);
                                    localStorage.setItem("trackedObjects", JSON.stringify(trackedObjects));

                                    $('#table').bootstrapTable('prepend', row);
                                },
                                'click #followSatellite': (event, value, row, index) => {
                                    const scene = engineInstance.sceneManager.getActiveScene();

                                    // Disable follows for all objects
                                    const allSatellites = _.filter(scene.children, (child) => child.type === 'satellite');
                                    allSatellites.forEach(item => item.follow = false);

                                    const satelliteObject = _.findWhere(scene.children, { satelliteId: row.satelliteId });
                                    if (satelliteObject) {
                                        satelliteObject.follow = true;
                                        row.follow = true;
                                    }

                                    jQuery('#table').bootstrapTable('updateCellByUniqueId', { id: row.id, field: 'actions', value: row })
                                },
                                'click #unfollowSatellite': (event, value, row, index) => {
                                    const scene = engineInstance.sceneManager.getActiveScene();
                                    const allSatellites = _.filter(scene.children, (child) => child.type === 'satellite');

                                    allSatellites.forEach(item => item.follow = false);
                                    row.follow = false;

                                    jQuery('#table').bootstrapTable('updateCellByUniqueId', { id: row.id, field: 'actions', value: row })
                                }
                            }
                        },

                    ]
                });
            }
        });

        UIManager.createTab(this.SearchTab);
        UIManager.createTab(this.TrackingTab);


        // Set the assetLoader base url
        this.assetLoader.setUrl(`http://api.${window.location.hostname}`);
        this.assetLoader.setUI(UIManager);


        // Create a new camera and assign it to this scene
        const camera = new API.Components.Cameras.TrackballCamera();
        this.setActiveCamera(camera);

        camera.position = new Vector3(4.360517114658246, 4.776140059675776, 12.569062580608882)
        camera.rotation = new Vector3(-0.6286608636793694, 0, 0);
        camera.controls.rotateSpeed = 1;
        camera.controls.noPan = true;
        camera.position.z = 15000;


        this.add(new THREE.AmbientLight(0x333333, 5.5));


        // Create earth Sphere
        const earth = await this.earthSphere();
        this.add(earth);
    }
}