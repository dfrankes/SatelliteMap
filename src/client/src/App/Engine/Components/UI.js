import Handlebars from 'handlebars';

class UI {
    $domRoot;
    elements = [];
    tabs = [];

    constructor() {
        if (!UI.instance) {
            UI.instance = this;
        }
        
        this.cleanUp();

        // Load our base UI template
        let UITemplate = require('./UI/Templates/UI.html');
        let template = Handlebars.compile(UITemplate);
        const html = template({});

        this.$domRoot = jQuery(html);
        this.tabs = [];

        jQuery('body').append(this.$domRoot);


        this.registerEvents();

        return UI.instance;
    }


    cleanUp = (element_id = 'EngineUI') => {
        if (document.getElementById(element_id)) {
            document.getElementById(element_id).remove()
        }
    }


    createTab = (tab) => {
        this.tabs.push(tab);

        // Append tabTitle
        this.$domRoot.find('#tabList').prepend(tab.tabHeader)
        this.$domRoot.find('#tabContent').append(tab.tabContent)
        this.registerEvents();
        tab.tabScript(tab);
    }

    registerEvents = () => {
        // Register all events
        Object.keys(this.events).forEach(event => {
            event.split().forEach(e => {
                const triggerEvent = e.split(" ")[0];
                const triggerElement = e.split(" ")[1];
                const foundElem = this.$domRoot.find(triggerElement);
                if (foundElem) {
                    foundElem.unbind();
                    foundElem.on(triggerEvent, (ev) => this.events[event](ev));
                }
            })
        });
    }

    events = {
        'click .nav-link': (event) => {

            const isActive = jQuery(event.target).hasClass('active');
            const tabTarget = jQuery(event.target).parent();


            const tab = _.findWhere(this.tabs, { id: tabTarget.attr('id') });
            const allTabs = this.tabs.filter(item => item.id !== tabTarget.attr('id'));

            if (!tabTarget || tabTarget.hasClass('no-trigger') || !tab) return;

            allTabs.forEach(item => item.hideTab());

            // Enable tab
            if (isActive) {
                tab.hideTab();
                return;
            }
            tab.displayTab();
            event.preventDefault();
        }
    }
}

const uiInstance = new UI();
export default uiInstance;