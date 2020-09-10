import Panel from "../UI/Elements/Panel";
import Handlebars from 'handlebars';

import { Object3D, ObjectLoader, Vector2, MeshBasicMaterial, PlaneBufferGeometry, Vector3, Mesh, GridHelper, BoxBufferGeometry, Raycaster, LineBasicMaterial, LineSegments, DoubleSide, TextureLoader, HemisphereLight, HemisphereLightHelper, DirectionalLight, DirectionalLightHelper, AmbientLight } from "three/build/three.module";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

import EngineLayers from "../../Enumerators/EngineLayers";

export default class AssetLoader {

    items = [];
    baseUrl;
    gameObjects = [];
    currentItem = false;
    itemsFinished = 1;
    baseUrl;
    panel;

    setUrl = (url) => {
        this.baseUrl = url;
    }


    createUI = () => {
        let source = require('../UI/Elements/AssetLoader/assetLoader.html');
        let template = Handlebars.compile(source);
        this.panel = new Panel({ draggable: false, html: source });


        this.progressItem = jQuery(this.panel).find('#GameObjectLoader-currentItem');
        this.progress_bar = jQuery(this.panel).find('#GameObjectLoader-progress');
        this.progress_title = jQuery(this.panel).find('#GameObjectLoader-title');

    }

    destroy = () => {
        this.panel.remove();
    }

    loadTextures = async(textures, destroy = true) => {
        this.createUI();

        const loader = new TextureLoader();
        const returnTextures = [];
        for (let i = 0; i < textures.length; i++) {
            const element = textures[i];

            this.progress_title.html(`Loading textures (${i + 1}/${textures.length})`);
            this.progressItem.html(`${element.name} ${element.url}`);
            this.progress_bar.css('width', '100%');
            const texture = await new Promise(resolve => {
                loader.load(`${this.baseUrl}${element.url}`, (texture) => {
                    resolve(texture);
                });
            })
            returnTextures.push({...element, texture })
        }

        if (destroy) this.destroy();
        return returnTextures;
    }
}