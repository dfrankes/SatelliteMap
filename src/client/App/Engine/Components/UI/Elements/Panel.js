import UI from '../../UI';
import Handlebars from 'handlebars';
const { v4: uuidv4 } = require('uuid');

export default class Panel {

    id = uuidv4();
    element = false;
    constructor(settings) {
        const element = UI.createElement({ id: this.id, class: 'overlayUI w-100' });

        let source = require('./Panel/panel.html');
        let template = Handlebars.compile(settings.html || source);
        let result = template({
            defaults: {
                item_id: this.id
            }
        })

        jQuery(element).html(result);
        UI.center(this.id);

        if (settings.draggable) {
            UI.dragElement(document.getElementById(this.id));
        }
        this.element = element;
        return element;
    }
}