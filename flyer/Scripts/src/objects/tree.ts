
import { Scene, AbstractMesh } from "babylonjs"
import {Reflectionable} from "../environment/reflectionable"
import {config} from "../config"
import {Obstacle} from "./obstacle"

export class Tree implements Reflectionable,Obstacle {

    private _loaded : Promise<any>;
    private _meshes: AbstractMesh[];

    constructor(private _scene: Scene, 
                private _name:string, 
                private _asset:string) {
        this._loaded = new Promise<any>((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh(null, config.assetPath, this._asset, this._scene, (meshes, p, s) => {
                this._meshes = meshes;
                meshes[0].position.x = -20;
                meshes[0].position.z = -10;
                
                resolve();
            });
        });
    }

    addToReflectionSurface(reflectionSurface) {
        this._loaded.then(function() {
            reflectionSurface.addToDynamicTextures(this._meshes[0]);
            reflectionSurface.addToDynamicTextures(this._meshes[1]);        
        });
    }

    addToCollisionCollection(collisions) {
        this._loaded.then(function() {
            collisions.push(this._meshes[0], this._meshes[1]);       
        });
    }
}