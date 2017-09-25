import * as BABYLON from "babylonjs"

export class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _light0: BABYLON.PointLight;
    private _light1: BABYLON.HemisphericLight;

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    createScene(): void {
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.collisionsEnabled = true;
        this._scene.workerCollisions = true;
        //this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        //this.scene.fogStart = 40.0;
        //this.scene.fogEnd = 80.0;

        this._camera = new BABYLON.ArcRotateCamera("CameraBaseRotate", 1, Math.PI * 0.25, 20, new BABYLON.Vector3(0, 5, 0), this._scene);
        this._camera.wheelPrecision = 15;
        this._camera.lowerRadiusLimit = 5;
        this._camera.upperRadiusLimit = 40;
        this._camera.upperBetaLimit = 0.45 * Math.PI;
        this._camera.maxZ = 150;
        this._scene.activeCamera = this._camera;
        this._camera.attachControl(this._canvas);

        this._light0 = new BABYLON.PointLight("spot", new BABYLON.Vector3(10, 10, 50), this._scene);
        this._light0.diffuse = new BABYLON.Color3(1, 1, 1);
        this._light0.specular = new BABYLON.Color3(0, 0, 0);
        
        this._light1 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), this._scene);
        this._light1.diffuse = new BABYLON.Color3(1, 1, 1);
        this._light1.specular = new BABYLON.Color3(1, 1, 1);
        this._light1.groundColor = new BABYLON.Color3(0, 0, 0);

        //this._scene.debugLayer.show();
    }

    animate(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}