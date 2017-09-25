
import { Scene, AbstractMesh, PhysicsImpostor, Animatable, Vector3 } from "babylonjs"
import { Reflectionable } from "../environment/reflectionable"
import { config } from "../config"
import { Obstacle } from "./obstacle"
import { Targetable } from "./targetable"

export class DefaultCharacter implements Targetable {

    private _loaded: Promise<any>;
    private _mesh: AbstractMesh;
    private _walkingAnimation: Animatable;
    private _isLoaded = false;

    constructor(private _scene: Scene,
        private _asset: string) {

        this._loaded = new Promise<any>((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh(null, config.assetPath, this._asset, this._scene, (meshes, p, s) => {
                this._mesh = meshes[0];
                this._mesh.physicsImpostor = new PhysicsImpostor(this._mesh, PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0.9 }, this._scene);
                this._isLoaded = true;
                resolve();
            });
        });
    }

    startWalkingAnimation() {
        if (!this._walkingAnimation && this._isLoaded) {
            this._walkingAnimation =
                this._scene.beginAnimation(this._mesh.skeleton, 0, 10, true);
        }
    }

    stopWalkingAnimation() {
        if (this._walkingAnimation) {
            this._walkingAnimation.stop();
            this._walkingAnimation = null;
        }
    }
    setAsTarget(camera) {
        this._loaded.then(function () {
            camera.target = this._mesh;
        });
    }

    rotateYaw(y: number) {
        if (this._loaded) {
            this._mesh.rotation.y += y;
        }
    }
}