import { DefaultCharacter } from "./objects/default-character"
import { IKeyStateService } from "./input/keystate";

const FORWARD_SPEED = 0.2;
const TURN_SPEED = 0.05;

export class Player {

    private _char: DefaultCharacter;

    constructor(private _scene: BABYLON.Scene, asset: string, camera: BABYLON.ArcRotateCamera, private _keyStateService: IKeyStateService) {
        this._char = new DefaultCharacter(this._scene, asset);
        this._char.setAsTarget(camera);
        this._scene.registerBeforeRender(this.update.bind(this));
    }

    private _speed = 0;
    private _turnspeed = 0;
    private _forwards: BABYLON.Vector3;

    private keyboardControl() {
        var keys = this._keyStateService.get();
        if (keys.forward) {
            this._speed = FORWARD_SPEED;
        }
        else {
            this._speed = 0;
        }
        if (keys.left) {
            this._turnspeed = -TURN_SPEED;
        }
        else if (keys.right) {
            this._turnspeed = TURN_SPEED;
        }
        else {
            this._turnspeed = 0;
        }
    }

    private update() {
        this.keyboardControl();
        var ratio = this._scene.getAnimationRatio();

        if (this._speed) {
            //this._forwards = new BABYLON.Vector3(-Math.sin(this._mesh.rotation.y), 0, -Math.cos(this._mesh.rotation.y)).normalize();
            //this.mover.moveWithCollisions(this._mesh, this._forwards.scale(ratio * this._speed));
            this._char.startWalkingAnimation();
        }
        else {
            this._char.stopWalkingAnimation();
        }
        this._char.rotateYaw(this._turnspeed * ratio);

        //if ((<any>window).setPosition) {
        //    (<any>window).setPosition({
        //        x: this._mesh.position.x,
        //        y: this._mesh.position.y,
        //        z: this._mesh.position.z,
        //        yaw: this._mesh.rotation.y
        //    });
        //}
    }
}