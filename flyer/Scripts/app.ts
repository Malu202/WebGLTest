﻿module ilands {

    interface IKeyState {
        left: boolean;
        right: boolean;
        forward: boolean;
        back: boolean;
    }

    interface IKeyStateService {
        get(): IKeyState;
    }

    interface IMover {
        moveWithCollisions(mesh: BABYLON.AbstractMesh, direction: BABYLON.Vector3);
    }

    class KeyStateService implements IKeyStateService {
        constructor() {
            var keys: IKeyState = this._keyState = { left: false, right: false, forward: false, back: false };

            function handleKeyDown(evt) {
                var tag = evt.target.tagName.toLowerCase();
                if (tag == 'input' || tag == 'textarea')
                    return;

                if (evt.keyCode == 65) {//A
                    keys.left = true;
                }
                if (evt.keyCode == 68) {//D
                    keys.right = true;
                }
                if (evt.keyCode == 87) {//W
                    keys.forward = true;
                }
                if (evt.keyCode == 83) {//S
                    keys.back = true;
                }
            }

            function handleKeyUp(evt) {
                if (evt.keyCode == 65) {
                    keys.left = false;
                }
                if (evt.keyCode == 68) {
                    keys.right = false;
                }
                if (evt.keyCode == 87) {
                    keys.forward = false;
                }
                if (evt.keyCode == 83) {
                    keys.back = false;
                }
            }
            window.addEventListener("keydown", handleKeyDown, false);
            window.addEventListener("keyup", handleKeyUp, false);
        }
        private _keyState: IKeyState;
        get() {
            return this._keyState;
        }
    }

    class Mover implements IMover {
        constructor(private grounds: BABYLON.AbstractMesh[], private collisions: BABYLON.AbstractMesh[]) { }
        private checkOnGround(desiredPoint: BABYLON.Vector3): BABYLON.Vector3 {
            var intersection: BABYLON.PickingInfo;
            var downRay = new BABYLON.Ray(desiredPoint, new BABYLON.Vector3(0, -1, 0));
            var upRay;
            for (var i = 0; i < this.grounds.length; i++) {
                intersection = this.grounds[i].intersects(downRay);
                if (!intersection.hit) {
                    upRay = upRay || new BABYLON.Ray(desiredPoint, new BABYLON.Vector3(0, 1, 0));
                    intersection = this.grounds[i].intersects(upRay);
                }
                if (intersection.hit) {
                    break;
                }
            }
            if (intersection.hit) {
                return intersection.pickedPoint;
            }
            return null;
        }

        moveWithCollisions(mesh: BABYLON.AbstractMesh, direction: BABYLON.Vector3) {
            var desiredPoint = mesh.position.add(direction);
            var groundPosition = this.checkOnGround(desiredPoint);
            if (groundPosition) {
                //if (Math.abs(Math.asin(BABYLON.Vector3.Dot(mesh.position.subtract(groundPosition).normalize(), new Vector3(0, 1, 0)))) < Math.PI / 6) {
                var before = mesh.position;
                mesh.position = groundPosition;
                for (var i = 0; i < this.collisions.length; i++) {
                    var collider = this.collisions[i];
                    var colliderPos = collider.absolutePosition;
                    if (collider.intersectsMesh(mesh, false) && !(before.subtract(colliderPos).length() <= mesh.position.subtract(colliderPos).length())) {
                        mesh.position = before;
                        break;
                    }
                }
                //}
            }
        }
    }

    class Player {

        private _mesh: BABYLON.AbstractMesh;

        constructor(private scene: BABYLON.Scene, assetName: string, camera: BABYLON.ArcRotateCamera, private keyStateService: IKeyStateService, private mover: IMover) {
            var that = this;
            BABYLON.SceneLoader.ImportMesh(assetName, "Assets/blender/", "player.babylon", scene, (meshes, p, s) => {
                that._mesh = meshes[0];
                camera.target = meshes[0];
                scene.registerBeforeRender(this.update.bind(this));
                that._mesh.setPhysicsState(BABYLON.PhysicsEngine.CylinderImpostor);
            });
        }

        private _speed = 0;
        private _turnspeed = 0;
        private _forwards: BABYLON.Vector3;

        private keyboardControl() {
            var keys = this.keyStateService.get();
            if (keys.forward) {
                this._speed = 0.2;
            }
            else {
                this._speed = 0;
            }

            if (keys.left) {
                this._turnspeed = -0.05;
            }
            else if (keys.right) {
                this._turnspeed = 0.05;
            }
            else {
                this._turnspeed = 0;
            }
        }

        private _animation: BABYLON.Animatable;

        private update() {
            this.keyboardControl();
            var ratio = this.scene.getAnimationRatio();

            if (this._speed) {
                this._forwards = new BABYLON.Vector3(-Math.sin(this._mesh.rotation.y), 0, -Math.cos(this._mesh.rotation.y)).normalize();
                this.mover.moveWithCollisions(this._mesh, this._forwards.scale(ratio * this._speed));
                if (!this._animation) {
                    this._animation = this.scene.beginAnimation(this._mesh.skeleton, 0, 10, true);
                }
            }
            else {
                if (this._animation) {
                    this._animation.stop();
                    this._animation = null;
                }
            }
            if (this._turnspeed) {
                this._mesh.rotation.y += this._turnspeed * ratio;
            }

            if ((<any>window).setPosition) {
                (<any>window).setPosition({
                    x: this._mesh.position.x,
                    y: this._mesh.position.y,
                    z: this._mesh.position.z,
                    yaw: this._mesh.rotation.y
                });
            }
        }
    }

    var ilands = function () {

        var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        var engine = new BABYLON.Engine(canvas, true);
        var scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true;
        scene.workerCollisions = true;
        //scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        //scene.fogStart = 40.0;
        //scene.fogEnd = 80.0;

        var light = new BABYLON.PointLight("spot", new BABYLON.Vector3(10, 10, 50), scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.specular = new BABYLON.Color3(0, 0, 0);

        var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
        light0.diffuse = new BABYLON.Color3(1, 1, 1);
        light0.specular = new BABYLON.Color3(1, 1, 1);
        light0.groundColor = new BABYLON.Color3(0, 0, 0);


        var camera = new BABYLON.ArcRotateCamera("CameraBaseRotate", 1, Math.PI * 0.25, 20, new BABYLON.Vector3(0, 5, 0), scene);
        camera.wheelPrecision = 15;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 40;
        camera.upperBetaLimit = 0.45 * Math.PI;
        camera.maxZ = 150;
        scene.activeCamera = camera;
        camera.attachControl(canvas);

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 150, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("Assets/skybox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;


        BABYLON.Engine.ShadersRepository = "Assets/shader/";
        var water = BABYLON.Mesh.CreateGround("water", 200, 200, 1, scene, false);
        water.position.y = -3;
        var waterMaterial = new shaders.WaterMaterial("water", scene, light);
        water.material = waterMaterial;

        waterMaterial.reflectionTexture.renderList.push(skybox);

        var collisions = new Array<BABYLON.AbstractMesh>();

        BABYLON.SceneLoader.ImportMesh(null, "Assets/blender/", "urcark_seperated.babylon", scene, (meshes, p, s) => {
            //waterMaterial.reflectionTexture.renderList.push(meshes[0]);
            waterMaterial.reflectionTexture.renderList.push(meshes[1]);
            //waterMaterial.refractionTexture.renderList.push(meshes[0]);
            waterMaterial.refractionTexture.renderList.push(meshes[1]);
            var player = new Player(scene, "Player", camera, new KeyStateService(), new Mover([meshes[1]], collisions));
        });


        BABYLON.SceneLoader.ImportMesh(null, "Assets/blender/", "tree.babylon", scene, (meshes, p, s) => {
            waterMaterial.reflectionTexture.renderList.push(meshes[0]);
            waterMaterial.reflectionTexture.renderList.push(meshes[1]);
            waterMaterial.refractionTexture.renderList.push(meshes[0]);
            waterMaterial.refractionTexture.renderList.push(meshes[1]);
            meshes[0].position.x = -20;
            meshes[0].position.z = -10;
            collisions.push(meshes[0], meshes[1]);
        });

        engine.runRenderLoop(function () {
            scene.render();
        });

        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
            engine.resize();
        });
        //scene.debugLayer.show();

        interface Position {
            x?: number;
            y?: number;
            z?: number;
            yaw?: number;
        }

        interface OtherPlayer {
            mesh?: BABYLON.AbstractMesh;
            pos?: Position;
            animation?: BABYLON.Animatable
        }

        var clients = {};

        var other_turnspeed = 0.05;
        var other_speed = 0.2;

        (<any>window).setPlayerPosition = function (clientId: string, position: Position) {
            if (!clients[clientId]) {
                var otherPlayer: OtherPlayer = { pos: position };
                clients[clientId] = otherPlayer;
                BABYLON.SceneLoader.ImportMesh("Player", "Assets/blender/", "player.babylon", scene, (meshes, p, s) => {
                    otherPlayer.mesh = meshes[0];
                    scene.registerBeforeRender(function () {
                        
                        if ((otherPlayer.mesh.rotation.y - otherPlayer.pos.yaw) > other_turnspeed) {
                            otherPlayer.mesh.rotation.y -= other_turnspeed;
                        } else if ((otherPlayer.mesh.rotation.y - otherPlayer.pos.yaw) < other_turnspeed) {
                            otherPlayer.mesh.rotation.y += other_turnspeed;
                        }
                        var forward = new BABYLON.Vector3(-Math.sin(otherPlayer.mesh.rotation.y), 0, -Math.cos(otherPlayer.mesh.rotation.y)).normalize();
                        var distance = new BABYLON.Vector3(otherPlayer.pos.x, otherPlayer.pos.y, otherPlayer.pos.z).subtract(otherPlayer.mesh.position);
                        if (distance.length() > other_speed) {
                            otherPlayer.mesh.position = otherPlayer.mesh.position.add(distance.normalize().scale(other_speed));
                            if (!otherPlayer.animation) {
                                otherPlayer.animation = scene.beginAnimation(otherPlayer.mesh.skeleton, 0, 10, true);
                            }
                        } else {
                            if (otherPlayer.animation) {
                                otherPlayer.animation.stop();
                                otherPlayer.animation = null;
                            }
                        }
                    });
                });
            } else {
                clients[clientId].pos = position;
            }
        }

    };

    ilands();
}