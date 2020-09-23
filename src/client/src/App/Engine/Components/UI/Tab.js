import UI from '../UI';
import Handlebars from 'handlebars';
const { v4: uuidv4 } = require('uuid');

export default class Tab {
    UIManager = UI;
    id = uuidv4();


    tabContent = false;
    tabHeader = false;

    constructor(settings) {

        settings.tabId = this.id;


        let tabHeader = require('./Templates/tabs/tab.html');
        let tabHeaderTemplate = Handlebars.compile(tabHeader);
        tabHeader = tabHeaderTemplate(settings);


        let tabContent = require('./Templates/tabs/tabContent.html');
        let tabContentTemplate = Handlebars.compile(tabContent);
        tabContent = tabContentTemplate(settings);


        this.tabHeader = jQuery(tabHeader);
        this.tabContent = jQuery(tabContent);
        this.tabScript = settings.tabScript || function() {}
        this.tabHeaderEvents = settings.tabHeaderEvents || {};
        this.contentEvents = settings.contentEvents || {};
        this.onActiveChangeEvent = settings.onActiveChangeEvent || function(active) {};

        this.registertabHeaderEvents();
        this.registerContentEvents();

    }

    // On display event
    displayTab = () => {
        const tabButton = jQuery(_.first(this.tabHeader.children()))
        const tabContent = this.tabContent;

        tabButton.addClass('active');
        tabContent.addClass('active').addClass('show');

        this.onActiveChangeEvent(true);
    }

    // On hide tab event
    hideTab = () => {
        const tabButton = jQuery(_.first(this.tabHeader.children()))
        const tabContent = this.tabContent;

        tabButton.removeClass('active');
        tabContent.removeClass('active').removeClass('show');

        this.onActiveChangeEvent(false);
    }

    registertabHeaderEvents = () => {
        // Register all events
        Object.keys(this.tabHeaderEvents).forEach(event => {
            event.split().forEach(e => {
                const triggerEvent = e.split(" ")[0];
                const triggerElement = e.split(" ")[1];
                const foundElem = this.tabHeader.find(triggerElement);
                if (foundElem) {
                    foundElem.unbind();
                    foundElem.on(triggerEvent, (ev) => this.tabHeaderEvents[event](ev));
                }
            })
        });
    }

    registerContentEvents = () => {
        // Register all events
        Object.keys(this.contentEvents).forEach(event => {
            event.split().forEach(e => {
                const triggerEvent = e.split(" ")[0];
                const triggerElement = e.split(" ")[1];
                const foundElem = this.tabContent.find(triggerElement);
                if (foundElem) {
                    foundElem.unbind();
                    foundElem.on(triggerEvent, (ev) => this.contentEvents[event](ev));
                }
            })
        });
    }

    helpers = {};
}