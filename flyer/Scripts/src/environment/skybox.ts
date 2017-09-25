
import { Scene, Color3, Texture, CubeTexture, StandardMaterial, Mesh } from "babylonjs"
import {Reflectionable} from "./reflectionable"

export class Skybox implements Reflectionable {

    private _mesh: Mesh;

    constructor(private _scene: Scene, private _name:string, private _size:number) {
        this._mesh = Mesh.CreateBox(this._name, this._size, this._scene);
        var skyboxMaterial = new StandardMaterial("skyBox", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("Assets/skybox/skybox", this._scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this._mesh.material = skyboxMaterial;
    }

    addToReflectionSurface(reflectionSurface) {
        reflectionSurface.addToDynamicTextures(this._mesh);
    }
}