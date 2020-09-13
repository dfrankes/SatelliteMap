import Handlebars from 'handlebars';
import ServerAPI from '../Components/ServerAPI';
import SatellitePrefab from '../Prefabs/SatellitePrefab';
import API from '../../../API';
import engineInstance from '../../../../Engine';

export default class Navigator {
    nav = null;
    serverAPI = new ServerAPI();
    activeScene = null;
    constructor(scene) {
        this.activeScene = scene;

        // Register all template helpers
        Object.keys(this.helpers).forEach(helper => {
            Handlebars.registerHelper(helper, this.helpers[helper]);
        });

        // Load template HTML
        let navSource = require('../templates/Controller.html');
        let template = Handlebars.compile(navSource);
        const html = template({});

        this.nav = jQuery(html)


        this.registerEvents();

        // Add navigator to page
        jQuery('#mapUI').append(this.nav);
        jQuery('.table-wrapper').css('max-height', jQuery('#innerContent').innerHeight());

        // Load from localStorage
        let trackedItems = JSON.parse(localStorage.getItem("trackedObjects")) || [];
        trackedItems.forEach(item => {
            const satellite = new SatellitePrefab(item);
            this.activeScene.add(satellite);
        });

        this.refreshTrackedObjects();
        jQuery('#mapUI').removeClass('d-none');


        this.setMaxWindowHeight()
        window.addEventListener('resize', this.setMaxWindowHeight, false);


        const trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];

        // Setup table
        let detailSource = require('../templates/table/satelliteDetails.html');
        $('#table').bootstrapTable({
            data: trackedObjects,
            detailView: true,
            defaultViewByClick: true,
            detailFormatter: (index, item, element) => {
                let template = Handlebars.compile(detailSource);
                return template(item);
            },
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
                    title: "Latitude"
                },
                {
                    field: "info.lng",
                    title: "Longitude"
                },
                {
                    'field': false,
                    'title': '',
                    clickToSelect: false,
                    formatter: (value, row, index) => {

                        const trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
                        const tracking = _.findWhere(trackedObjects, { _id: row._id });
                        if (tracking) {
                            return [
                                '<button class="btn btn-sm btn-primary mr-1" id="enableSatellite"><i class="fa fa-check"></i> Enable</button>',
                                '<button class="btn btn-sm btn-primary mr-1" id="followSatellite"><i class="fa fa-plus"></i> Follow Satellite</button>',
                                '<button class="btn btn-sm btn-primary mr-1" id="showOrbitObject"><i class="fa fa-plus"></i> Show Satellite Orbit</button>',
                                '<button class="btn btn-sm btn-primary mr-1" id="showOrbitObject"><i class="fa fa-minus"></i> Remove Satellite</button>',
                            ].join('')
                        }

                        return [
                            '<button class="btn btn-sm btn-primary" id="addSatelliteBtn"><i class="fa fa-plus"></i> Track Object</button>',
                        ].join('')
                    },
                    events: {
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
                            satelliteObject.follow = true;
                            row.follow = true;
                        }
                    }
                },

            ]
        });


        jQuery('canvas').on('mousedown', () => {
            // Unset the classes for all nav-links
            jQuery('.nav-link').removeClass('active');
            jQuery('.tab-pane').removeClass('active');
            jQuery('.tab-pane').removeClass('show');
        })

    }


    setMaxWindowHeight = () => {
        const wrapper = jQuery('.table-wrapper');
        wrapper.css('max-height', window.innerHeight / 4 + 'px');
    }

    registerEvents = () => {
        // Register all events
        Object.keys(this.events).forEach(event => {
            event.split().forEach(e => {
                const triggerEvent = e.split(" ")[0];
                const triggerElement = e.split(" ")[1];
                const foundElem = this.nav.find(triggerElement);
                if (foundElem) {
                    foundElem.on(triggerEvent, (ev) => this.events[event](ev));
                }
            })
        });
    }


    refreshTrackedObjects = () => {
        let trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
        jQuery('#table').bootstrapTable('load', trackedObjects);
    }

    unregisterEvents = () => {
        Object.keys(this.events).forEach(event => {
            event.split().forEach(e => {
                const triggerEvent = e.split(" ")[0];
                const triggerElement = e.split(" ")[1];
                const foundElem = this.nav.find(triggerElement);
                if (foundElem) {
                    foundElem.unbind();
                }
            })
        });
    }


    helpers = {}

    events = {
        'input #searchInput': async(event) => {
            setTimeout(async() => {
                const value = jQuery(event.target).val();
                const $table = jQuery('#table').bootstrapTable();

                if (value === "") {
                    let trackedObjects = JSON.parse(localStorage.getItem("trackedObjects")) || [];
                    jQuery('#table').bootstrapTable('load', trackedObjects);
                    return;
                }

                // Get Satallite Info
                const request = await this.serverAPI.request('post', 'search', { query: value });
                let data = request.data.results;

                if (data) {
                    jQuery('#table').bootstrapTable('load', data);
                }
            }, 1000)
        },
        'click .nav-link': (event) => {

            const isActive = jQuery(event.target).hasClass('active');
            const tabTarget = jQuery(event.target).attr('aria-controls');
            if (!tabTarget) return;

            if (!isActive) {

                // Unset the classes for all nav-links
                jQuery('.nav-link').removeClass('active');
                jQuery('.tab-pane').removeClass('active');
                jQuery('.tab-pane').removeClass('show');



                jQuery(event.target).addClass('active');

                jQuery(`#${tabTarget}`).addClass('show');
                jQuery(`#${tabTarget}`).addClass('active');
            } else {
                jQuery(event.target).removeClass('active');
                jQuery(`#${tabTarget}`).removeClass('show');
                jQuery(`#${tabTarget}`).removeClass('active');
            }
            event.preventDefault();
        }
    }
}