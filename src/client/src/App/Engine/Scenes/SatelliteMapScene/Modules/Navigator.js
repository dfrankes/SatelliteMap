import Handlebars from 'handlebars';
import ServerAPI from '../Components/ServerAPI';
import SatellitePrefab from '../Prefabs/SatellitePrefab';

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
    }

    helpers = {

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
    events = {
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
            }
        }
    }
}