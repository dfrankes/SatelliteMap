import { TextureLoader } from 'three/build/three.module';
import API from '../../API';

export default class AssetLoader {

    baseUrl = '';
    setUI = (UIManager) => {
        this.UIManager = UIManager;
    }
    setUrl = (url) => {
        this.baseUrl = url;
    }


    constructor() {
        this.setUI(API.Components.UI.UIManager);
    }
    loadTextures = async(textures, showLoading = true) => {
        const loader = new TextureLoader();
        const returnTextures = [];
        for (let i = 0; i < textures.length; i++) {
            const element = textures[i];

            if (showLoading) {
                this.UIManager.innerHTML = `<img src="https://i.imgur.com/KV8Y5DU.gif" width="16"> Loading textures (${i + 1}/${textures.length}) | ${element.name} ${element.url}`
            }
            const texture = await new Promise(resolve => {
                loader.load(`${this.baseUrl}${element.url}`, (texture) => {
                    resolve(texture);
                });
            })
            returnTextures.push({...element, texture })
        }

        this.UIManager.innerHTML = ` `
        return returnTextures;
    }
}