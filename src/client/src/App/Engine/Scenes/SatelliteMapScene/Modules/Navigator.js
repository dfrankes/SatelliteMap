import Handlebars from 'handlebars';
import ServerAPI from '../Components/ServerAPI';
import SatellitePrefab from '../Prefabs/SatellitePrefab';
import API from '../../../API';

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


        // Create SELECT2
        jQuery('.search').select2({
            ajax: {
                url: 'http://localhost:3002/search',
                dataType: 'json',
                data: (params) => {
                    return { search: params.term }
                }
            }
        });


        // Load from localStorage
        let trackedItems = JSON.parse(localStorage.getItem("trackedSatellites")) || [];
        trackedItems.forEach(item => {
            const satellite = new SatellitePrefab(item);
            this.activeScene.add(satellite);
        });

        this.refreshTrackedObjects();
        jQuery('#mapUI').removeClass('d-none');


        this.setMaxWindowHeight()
        window.addEventListener('resize', this.setMaxWindowHeight, false);
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
        // Load template HTML
        let navSource = require('../templates/TrackedObjects.html');
        let template = Handlebars.compile(navSource);
        const html = template({ objects: API.Managers.SceneManager.getActiveScene().trackedObjects });

        jQuery('#trackedObjects').html(html)
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
        'click .nav-link': (event) => {

            const isActive = jQuery(event.target).hasClass('active');
            const tabTarget = jQuery(event.target).attr('aria-controls');


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
        },
        'click #myCoolButton': (event) => {
            console.log("event!");
        },
        'change .search': async(event) => {
            const satalliteId = jQuery(event.target).val();

            // Get Satallite Info
            const request = await this.serverAPI.request('get', 'search/' + satalliteId);
            const data = request.data.satallite;

            if (data) {
                let panelSource = require('../templates/satellitePanel.html');
                let template = Handlebars.compile(panelSource);
                const html = template(data);
                jQuery('#satelliteInfo').html(html);

                this.unregisterEvents();
                this.registerEvents();
            }
        },
        'click #addSatellite': async(event) => {
            const satelliteId = jQuery(event.target).data('satelliteid');
            const request = await this.serverAPI.request('get', 'search/' + satelliteId);
            const data = request.data.satallite;

            if (data) {
                const satellite = new SatellitePrefab(data);
                this.activeScene.add(satellite);

                // Add satellite to cookie
                let current = JSON.parse(localStorage.getItem("trackedSatellites")) || [];
                current.push(data);
                localStorage.setItem("trackedSatellites", JSON.stringify(current));

                jQuery('#satelliteInfo').html(``);
                jQuery('.nav-link').removeClass('active');
                jQuery('.tab-pane').removeClass('active');
                jQuery('.tab-pane').removeClass('show');
            }
        }
    }
}