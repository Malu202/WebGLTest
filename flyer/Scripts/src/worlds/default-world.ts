import {Scene, Light} from "babylonjs"
import {Skybox} from "../environment/skybox"
import {Water} from "../environment/water"
import {Tree} from "../objects/tree"
import {CollisionObjects} from "../collisionobjects"

export class DefaultWord {
    constructor(private _scene:Scene, private _light:Light) {
        
    }

    create() {
        var collisions : CollisionObjects = [];
        var skybox = new Skybox(this._scene,"skybox", 150);
        var water = new Water(this._scene, "water", 200, this._light);
        water.addReflectionsFrom(skybox);
        var tree = new Tree(this._scene, "tree","tree.babylon");
        water.addReflectionsFrom(tree);
        tree.addToCollisionCollection(collisions);
    }
}