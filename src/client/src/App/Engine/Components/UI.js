class UI {
    $domRoot;
    elements = [];

    constructor() {
        if (!UI.instance) {
            UI.instance = this;
        }

        this.removeOld('EngineUI');

        this.$domRoot = jQuery('<div></div>');
        this.$domRoot.attr({
            id: 'EngineUI',
            class: 'overplay',
        })

        jQuery('body').append(this.$domRoot);

        this.center = function(id) {
            let element = jQuery('#' + id);
            element.css({
                position: 'absolute',
                top: window.innerHeight / 2 - element.outerHeight(),
                left: window.innerWidth / 2 - ($(jQuery(element).children()[0]).innerWidth() / 2),
                'pointer-events': 'none'
            })
            return element;
        }
        return UI.instance;
    }


    createElement = (attr) => {
        this.removeOld(attr.id);
        const $element = jQuery('<div></div>');
        $element.attr(attr);

        this.$domRoot.append($element);
        this.elements.push($element);

        return $element;
    }


    removeElement = (element_id) => {
        document.getElementById(element_id).remove();
    }

    dragElement = (elmnt) => {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (document.getElementById(elmnt.id)) {
            document.getElementById(elmnt.id).onmousedown = dragMouseDown;
        } else {
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }


    removeOld = (id) => {
        if (document.getElementById(id))
            document.getElementById(id).remove();
    }
}

const uiInstance = new UI();
export default uiInstance;