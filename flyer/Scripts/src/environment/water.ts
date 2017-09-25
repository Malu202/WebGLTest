import { WaterMaterial } from "../materials/water"
import { Scene, Color3, Texture, CubeTexture, StandardMaterial, Mesh, Light,MeshBuilder,AbstractMesh } from "babylonjs"
import {Reflectionable, ReflectionSurface} from "./reflectionable"

export class Water implements ReflectionSurface {

    private _mesh: Mesh;
    private _waterMaterial;

    constructor(private _scene: Scene, private _name:string, private _size:number,
        private _light:Light) {
        this._mesh = MeshBuilder.CreateGround(this._name, {width: this._size, height: this._size}, this._scene);
        this._mesh.position.y = -3;
        this._waterMaterial = new WaterMaterial("water", this._scene, this._light);
        this._mesh.material = this._waterMaterial;
    }

    addReflectionsFrom(reflectionable:Reflectionable) {
        reflectionable.addToReflectionSurface(this);
    }

    addToDynamicTextures(mesh:AbstractMesh) {
        this._waterMaterial.reflectionTexture.renderList.push(mesh);
        this._waterMaterial.refractionTexture.renderList.push(mesh);
    }
}