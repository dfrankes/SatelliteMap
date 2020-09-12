import Component from "../Component";
import UI from '../UI';
import Engine from '../../../Engine';

export default class DeveloperTools extends Component {

    constructor() {
        super();
        this.name = this.constructor.name;
    }

    onStart = () => {
        const Tweakpane = require('tweakpane');

        const mainPanel = UI.createElement({ id: 'EngineController', class: 'overlayUI' });
        this.mainPanel = new Tweakpane({ container: document.getElementById(`EngineController`), title: `Engine Developer Tools`, expanded: false })

        // Move the Tools Panel to the left of the screen
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        jQuery(this.mainPanel.containerElem_).css('width', '350px');
        jQuery(this.mainPanel.containerElem_).css('left', windowWidth - this.mainPanel.containerElem_.clientWidth);
        jQuery(this.mainPanel.containerElem_).css('top', 0);


        this.mainPanel.addInput({ engine_version: 'dev-1.0.0' }, 'engine_version');


        this.mainPanel.addButton({ title: 'Engine Monitors' }).on('click', () => {
            if (!this.EngineMonitors_panel) {
                const EngineMonitors_panel = UI.createElement({ id: 'EngineMonitors_panel', class: 'overlayUI' });
                this.EngineMonitors_panel = new Tweakpane({ container: document.getElementById(`EngineMonitors_panel`), title: `Engine Monitors`, expanded: false })
                jQuery(this.EngineMonitors_panel.containerElem_).css('width', '350px');

                this.EngineMonitors_panel.addInput(this, 'uuid');
                this.EngineMonitors_panel.addMonitor(Engine.renderLoopManager, 'fps', {
                    label: `Frames per second`,
                    view: 'graph',
                    min: 0,
                    max: +90,
                });

                this.EngineMonitors_panel.addMonitor(Engine.renderLoopManager, 'delay', {
                    label: `Frame time (ms)`,
                    view: 'graph',
                    min: 0,
                    max: +100,
                });

                this.EngineMonitors_panel.addMonitor(Engine.renderLoopManager, 'delta', {
                    label: `Delta`,
                    view: 'graph',
                    min: 0,
                    max: +100,
                });

                UI.dragElement(document.getElementById('EngineMonitors_panel'));
            } else {
                this.EngineMonitors_panel = false;
                UI.removeElement('EngineMonitors_panel');
            }
        });

        this.mainPanel.addButton({ title: 'Engine Managers' }).on('click', () => {
            if (!this.EngineManagers_panel) {
                const EngineManagers_panel = UI.createElement({ id: 'EngineManagers_panel', class: 'overlayUI' });
                this.EngineManagers_panel = new Tweakpane({ container: document.getElementById(`EngineManagers_panel`), title: `Engine Managers`, expanded: false });
                jQuery(this.EngineManagers_panel.containerElem_).css('width', '350px');

                let gameLoopManagerFolder = this.EngineManagers_panel.addFolder({ title: 'GameLoopManager', expanded: false });

                this.EngineManagers_panel.addSeparator();

                gameLoopManagerFolder.addInput(this, 'uuid');
                let keysy = Object.keys(Engine.renderLoopManager);
                keysy.forEach(key => {
                    if (!["function", "array", "object"].includes(typeof Engine.renderLoopManager[key])) {
                        gameLoopManagerFolder.addInput(Engine.renderLoopManager, key);
                    }
                });

                this.EngineManagers_panel.addSeparator();
                this.EngineManagers_panel.addFolder({ title: 'SceneManager', expanded: false });
                this.EngineManagers_panel.addSeparator();


                // RenderManager
                let rendererManager = this.EngineManagers_panel.addFolder({ title: 'SceneMRendererManager', expanded: false });
                rendererManager.addSeparator();
                let rendererFolder = rendererManager.addFolder({ title: 'Renderer', expanded: false });

                let keys = Object.keys(Engine.rendererManager.renderer);
                keys.forEach(key => {
                    if (!["function", "array", "object"].includes(typeof Engine.rendererManager.renderer[key])) {
                        rendererFolder.addInput(Engine.rendererManager.renderer, key);
                    }
                });

                UI.dragElement(document.getElementById('EngineManagers_panel'));
            } else {
                this.EngineManagers_panel = false;
                UI.removeElement('EngineManagers_panel');
            }
        });

        return;

        // const panel = UI.createElement({ id: 'EngineController', class: 'overlayUI' });
        // const Tweakpane = require('tweakpane');
        // this.pane = new Tweakpane({ container: document.getElementById(`EngineController`), title: `Engine Developer Tools`, expanded: true });
        // jQuery(this.pane.containerElem_).css('width', '350px')

        // this.pane.addSeparator();


        // this.pane.addButton({ title: 'Engine Monitors', });
        // this.pane.addButton({ title: 'Engine Managers', });

        // // Engine Monitors
        // const monitors = this.pane.addFolder({ title: `Monitors`, expanded: false });
        // monitors.addMonitor(Engine.gameLoopManager, 'fps', {
        //     label: `Frames per second`,
        //     view: 'graph',
        //     min: -1,
        //     max: +90,
        // });

        // monitors.addMonitor(Engine.gameLoopManager, 'delay', {
        //     label: `Frame time (ms)`,
        //     view: 'graph',
        //     min: -1,
        //     max: +999,
        // });

        // monitors.addMonitor(Engine.gameLoopManager, 'delta', {
        //     label: `Delta`,
        //     view: 'graph',
        //     min: -1,
        //     max: +999,
        // });


        // // Engine Manager controls
        // this.pane.addSeparator();
        // const managerControls = this.pane.addFolder({ title: `Engine Managers`, expanded: false });

        // managerControls.addSeparator();
        // let gameLoopManagerFolder = managerControls.addFolder({ title: 'GameLoopManager', expanded: false });

        // let keysy = Object.keys(Engine.gameLoopManager);
        // keysy.forEach(key => {
        //     if (!["function", "array", "object"].includes(typeof Engine.gameLoopManager[key])) {
        //         gameLoopManagerFolder.addInput(Engine.gameLoopManager, key);
        //     }
        // });

        // managerControls.addSeparator();
        // managerControls.addFolder({ title: 'SceneManager', expanded: false });
        // managerControls.addSeparator();


        // // RenderManager
        // let rendererManager = managerControls.addFolder({ title: 'SceneMRendererManager', expanded: false });
        // rendererManager.addSeparator();
        // let rendererFolder = rendererManager.addFolder({ title: 'Renderer', expanded: false });

        // let keys = Object.keys(Engine.rendererManager.renderer);
        // keys.forEach(key => {
        //     if (!["function", "array", "object"].includes(typeof Engine.rendererManager.renderer[key])) {
        //         rendererFolder.addInput(Engine.rendererManager.renderer, key);
        //     }
        // });

        // dragElement(document.getElementById('EngineController'));
    }
}