var shaders;
(function (shaders) {
    function WaterMaterial(name, scene, light) {
        this.name = name;
        this.id = name;
        this.light = light;
        this._scene = scene;
        scene.materials.push(this);
        this.bumpTexture = new BABYLON.Texture("Assets/bump.png", scene);
        this.bumpTexture.uScale = 2;
        this.bumpTexture.vScale = 2;
        this.bumpTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
        this.bumpTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;
        this.reflectionTexture = new BABYLON.MirrorTexture("reflection", 512, scene, true);
        this.refractionTexture = new BABYLON.RenderTargetTexture("refraction", 512, scene, true);
        this.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
        //this.refractionTexture.onBeforeRender = function () {
        //    BABYLON.clipPlane = new BABYLON.Plane(0, 1, 0, 0);
        //};
        //this.refractionTexture.onAfterRender = function () {
        //    BABYLON.clipPlane = null;
        //};
        this.waterColor = new BABYLON.Color3(0, 0.3, 0.1);
        this.waterColorLevel = 0.2;
        this.fresnelLevel = 1.0;
        this.reflectionLevel = 0.6;
        this.refractionLevel = 0.8;
        this.waveLength = 0.1;
        this.waveHeight = 0.15;
        this.waterDirection = new BABYLON.Vector2(0, 1.0);
        this._time = 0;
    }
    shaders.WaterMaterial = WaterMaterial;
    ;
    WaterMaterial.prototype = Object.create(BABYLON.Material.prototype);
    // Properties   
    WaterMaterial.prototype.needAlphaBlending = function () {
        return false;
    };
    WaterMaterial.prototype.needAlphaTesting = function () {
        return false;
    };
    // Methods   
    WaterMaterial.prototype.getRenderTargetTextures = function () {
        var results = [];
        results.push(this.reflectionTexture);
        results.push(this.refractionTexture);
        return results;
    };
    WaterMaterial.prototype.isReady = function (mesh) {
        var engine = this._scene.getEngine();
        if (this.bumpTexture && !this.bumpTexture.isReady) {
            return false;
        }
        this._effect = engine.createEffect("water", ["position", "normal", "uv"], ["worldViewProjection", "world", "view", "vLightPosition", "vEyePosition", "waterColor", "vLevels", "waveData", "windMatrix"], ["reflectionSampler", "refractionSampler", "bumpSampler"], "");
        if (!this._effect.isReady()) {
            return false;
        }
        return true;
    };
    WaterMaterial.prototype.bind = function (world, mesh) {
        this._time += 0.0001 * this._scene.getAnimationRatio();
        this._effect.setMatrix("world", world);
        this._effect.setMatrix("worldViewProjection", world.multiply(this._scene.getTransformMatrix()));
        this._effect.setVector3("vEyePosition", this._scene.activeCamera.position);
        this._effect.setVector3("vLightPosition", this.light.position);
        this._effect.setColor3("waterColor", this.waterColor);
        this._effect.setFloat4("vLevels", this.waterColorLevel, this.fresnelLevel, this.reflectionLevel, this.refractionLevel);
        this._effect.setFloat2("waveData", this.waveLength, this.waveHeight);
        // Textures        
        this._effect.setMatrix("windMatrix", this.bumpTexture.getTextureMatrix().multiply(BABYLON.Matrix.Translation(this.waterDirection.x * this._time, this.waterDirection.y * this._time, 0)));
        this._effect.setTexture("bumpSampler", this.bumpTexture);
        this._effect.setTexture("reflectionSampler", this.reflectionTexture);
        this._effect.setTexture("refractionSampler", this.refractionTexture);
    };
    WaterMaterial.prototype.dispose = function () {
        if (this.bumpTexture) {
            this.bumpTexture.dispose();
        }
        if (this.groundTexture) {
            this.groundTexture.dispose();
        }
        if (this.snowTexture) {
            this.snowTexture.dispose();
        }
        this.baseDispose();
    };
})(shaders || (shaders = {}));
var ilands;
(function (ilands_1) {
    var KeyStateService = (function () {
        function KeyStateService() {
            var keys = this._keyState = { left: false, right: false, forward: false, back: false };
            function handleKeyDown(evt) {
                var tag = evt.target.tagName.toLowerCase();
                if (tag == 'input' || tag == 'textarea')
                    return;
                if (evt.keyCode == 65) {
                    keys.left = true;
                }
                if (evt.keyCode == 68) {
                    keys.right = true;
                }
                if (evt.keyCode == 87) {
                    keys.forward = true;
                }
                if (evt.keyCode == 83) {
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
        KeyStateService.prototype.get = function () {
            return this._keyState;
        };
        return KeyStateService;
    }());
    var Mover = (function () {
        function Mover(grounds, collisions) {
            this.grounds = grounds;
            this.collisions = collisions;
        }
        Mover.prototype.checkOnGround = function (desiredPoint) {
            var intersection;
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
        };
        Mover.prototype.moveWithCollisions = function (mesh, direction) {
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
        };
        return Mover;
    }());
    var Player = (function () {
        function Player(scene, assetName, camera, keyStateService, mover) {
            var _this = this;
            this.scene = scene;
            this.keyStateService = keyStateService;
            this.mover = mover;
            this._speed = 0;
            this._turnspeed = 0;
            var that = this;
            BABYLON.SceneLoader.ImportMesh(assetName, "Assets/blender/", "player.babylon", scene, function (meshes, p, s) {
                that._mesh = meshes[0];
                camera.target = meshes[0];
                scene.registerBeforeRender(_this.update.bind(_this));
                that._mesh.setPhysicsState(BABYLON.PhysicsEngine.CylinderImpostor);
            });
        }
        Player.prototype.keyboardControl = function () {
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
        };
        Player.prototype.update = function () {
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
            if (window.setPosition) {
                window.setPosition({
                    x: this._mesh.position.x,
                    y: this._mesh.position.y,
                    z: this._mesh.position.z,
                    yaw: this._mesh.rotation.y
                });
            }
        };
        return Player;
    }());
    var ilands = function () {
        var canvas = document.getElementById("renderCanvas");
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
        var collisions = new Array();
        BABYLON.SceneLoader.ImportMesh(null, "Assets/blender/", "urcark_seperated.babylon", scene, function (meshes, p, s) {
            //waterMaterial.reflectionTexture.renderList.push(meshes[0]);
            waterMaterial.reflectionTexture.renderList.push(meshes[1]);
            //waterMaterial.refractionTexture.renderList.push(meshes[0]);
            waterMaterial.refractionTexture.renderList.push(meshes[1]);
            var player = new Player(scene, "Player", camera, new KeyStateService(), new Mover([meshes[1]], collisions));
        });
        BABYLON.SceneLoader.ImportMesh(null, "Assets/blender/", "tree.babylon", scene, function (meshes, p, s) {
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
        var clients = {};
        var other_turnspeed = 0.05;
        var other_speed = 0.2;
        window.setPlayerPosition = function (clientId, position) {
            if (!clients[clientId]) {
                var otherPlayer = { pos: position };
                clients[clientId] = otherPlayer;
                BABYLON.SceneLoader.ImportMesh("Player", "Assets/blender/", "player.babylon", scene, function (meshes, p, s) {
                    otherPlayer.mesh = meshes[0];
                    scene.registerBeforeRender(function () {
                        if ((otherPlayer.mesh.rotation.y - otherPlayer.pos.yaw) > other_turnspeed) {
                            otherPlayer.mesh.rotation.y -= other_turnspeed;
                        }
                        else if ((otherPlayer.mesh.rotation.y - otherPlayer.pos.yaw) < other_turnspeed) {
                            otherPlayer.mesh.rotation.y += other_turnspeed;
                        }
                        var forward = new BABYLON.Vector3(-Math.sin(otherPlayer.mesh.rotation.y), 0, -Math.cos(otherPlayer.mesh.rotation.y)).normalize();
                        var distance = new BABYLON.Vector3(otherPlayer.pos.x, otherPlayer.pos.y, otherPlayer.pos.z).subtract(otherPlayer.mesh.position);
                        if (distance.length() > other_speed) {
                            otherPlayer.mesh.position = otherPlayer.mesh.position.add(distance.normalize().scale(other_speed));
                            if (!otherPlayer.animation) {
                                otherPlayer.animation = scene.beginAnimation(otherPlayer.mesh.skeleton, 0, 10, true);
                            }
                        }
                        else {
                            if (otherPlayer.animation) {
                                otherPlayer.animation.stop();
                                otherPlayer.animation = null;
                            }
                        }
                    });
                });
            }
            else {
                clients[clientId].pos = position;
            }
        };
    };
    ilands();
})(ilands || (ilands = {}));
/// <reference path="Scripts/Materials/watermaterial.ts" />
/// <reference path="Scripts/app.ts" /> 
var app = angular.module("ChatTest", []).controller("ChatController", function ($scope, $timeout) {
    $scope.messages = [];
    function url() {
        var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        }
        else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += "/api/Test";
        return new_uri;
    }
    var ws = new WebSocket(url());
    var yourId = null;
    ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);
        if (msg.controller == "ChatController") {
            $timeout(function () {
                if (msg.payload.yourId) {
                    yourId = msg.payload.yourId;
                }
                $scope.messages.push(msg.payload);
            });
        }
        else if (msg.controller == "PlayerPositionController") {
            if (window.setPlayerPosition) {
                window.setPlayerPosition(msg.payload.clientId, msg.payload);
            }
        }
        else if (msg.controller == "CatchmeController") {
            $timeout(function () {
                console.log("a", yourId);
                if (msg.payload.clientId == yourId) {
                    $scope.yourTurn = true;
                    $scope.messages.push({ clientId: "", text: "Du bist dran!" });
                }
                else {
                    $scope.yourTurn = false;
                    $scope.messages.push({ clientId: "", text: msg.payload.clientId + " ist dran!" });
                }
            });
        }
    };
    var _pos = null;
    var lastPos = null;
    window.setPosition = function (pos) {
        if (!lastPos || (lastPos.x != pos.x || lastPos.y != pos.y || lastPos.z != pos.z || lastPos.yaw != pos.yaw)) {
            _pos = pos;
        }
        lastPos = pos;
    };
    ws.onopen = function () {
        setInterval(function () {
            if (_pos) {
                ws.send(JSON.stringify({ controller: "PlayerPositionController", action: "SendPosition", payload: _pos }));
                _pos = null;
            }
        }, 100);
    };
    $scope.send = function (e) {
        if (e.keyCode === 13) {
            ws.send(JSON.stringify({ controller: "ChatController", action: "Chat", payload: { text: $scope.text } }));
            $scope.text = "";
        }
    };
}).directive("scroll", function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.scroll, function () {
                return element[0].scrollTop = element[0].scrollHeight;
            }, true);
        }
    };
}).directive("clickunfocus", function ($window) {
    return {
        link: function (scope, element) {
            element.on("click", function () {
                return angular.element(document.activeElement)[0].blur();
            });
        }
    };
});
var Vector3 = BABYLON.Vector3;
var SceneLoader = BABYLON.SceneLoader;
var runHorse = function () {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
    // Light
    var spot = new BABYLON.PointLight("spot", new Vector3(250, 250, 250), scene);
    spot.diffuse = new BABYLON.Color3(1, 1, 1);
    spot.specular = new BABYLON.Color3(0, 0, 0);
    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(250, 250, 250);
    light.intensity = 0.1;
    var camera = new BABYLON.ArcRotateCamera("CameraBaseRotate", 1, Math.PI * 0.25, 20, new BABYLON.Vector3(0, 5, 0), scene);
    camera.wheelPrecision = 15;
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 30;
    camera.maxZ = 200;
    scene.activeCamera = camera;
    camera.attachControl(canvas);
    // Ground
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    var texture = new BABYLON.Texture("Assets/Wiese.png", scene);
    texture.uScale = 15;
    texture.vScale = 15;
    groundMaterial.diffuseTexture = texture;
    groundMaterial.specularPower = 10;
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "Assets/Molukken2.png", 512, 512, 30, 0, 30, scene, false);
    ground.material = groundMaterial;
    var speedCharacter = 8;
    var character;
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useVarianceShadowMap = true;
    ground.receiveShadows = true;
    var ani;
    SceneLoader.ImportMesh("Sphere", "Assets/", "Horse_turned.babylon", scene, function (meshes, p, s) {
        character = meshes[0];
        character.ellipsoid = new BABYLON.Vector3(1, 1.0, 1);
        character.checkCollisions = true;
        character.position = new Vector3(0, 32.5, 0);
        camera.target = character;
        ani = scene.beginAnimation(character.skeleton, 0, 20, true, 3);
        character.rotation.x = 0.5;
        heightMapCollision(character);
        //character.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 });
        shadowGenerator.getShadowMap().renderList.push(character);
    });
    var tree;
    SceneLoader.ImportMesh("Plane.041", "Assets/", "testbaum.babylon", scene, function (meshes, p, s) {
        tree = meshes[0];
        tree.ellipsoid = new BABYLON.Vector3(1, 1.0, 1);
        tree.checkCollisions = true;
        tree.position = new Vector3(50, 32.5, 0);
        heightMapCollision(tree);
        //tree.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 });
    });
    var keys = { left: 0, right: 0, forward: 0, back: 0 };
    var running = false;
    function heightMapCollision(mesh) {
        if (!mesh)
            return;
        var ray = new BABYLON.Ray(mesh.position, new Vector3(0, -1, 0));
        var info = ground.intersects(ray);
        if (!info.pickedPoint) {
            var ray = new BABYLON.Ray(mesh.position, new Vector3(0, 1, 0));
            var info = ground.intersects(ray);
        }
        var meshGround = info.pickedPoint || mesh.position;
        mesh.position.y = meshGround.y;
    }
    scene.registerBeforeRender(function () {
        //heightMapCollision(tree);
        if (character) {
            if (keys.forward) {
                var forwards = new BABYLON.Vector3(-Math.sin(character.rotation.y) / speedCharacter, 0, -Math.cos(character.rotation.y) / speedCharacter);
                forwards.negate();
                character.moveWithCollisions(forwards);
                ani.restart();
            }
            else {
                ani.pause();
            }
            if (keys.left) {
                character.rotation.y -= 5 * scene.getLastFrameDuration() / 1000;
            }
            if (keys.right) {
                character.rotation.y += 5 * scene.getLastFrameDuration() / 1000;
            }
            var ray = new BABYLON.Ray(character.position, new Vector3(0, -1, 0));
            var info = ground.intersects(ray);
            if (!info.pickedPoint) {
                var ray = new BABYLON.Ray(character.position, new Vector3(0, 1, 0));
                var info = ground.intersects(ray);
            }
            var characterGround = info.pickedPoint || character.position;
            var ray2 = new BABYLON.Ray(camera.position, new Vector3(0, -1, 0));
            var info2 = ground.intersects(ray2);
            character.position.y = characterGround.y + 0.6;
            camera.target = character.position.add(new Vector3(0, 2.5, 0));
            if (!info2.pickedPoint) {
                var ray2 = new BABYLON.Ray(camera.position, new Vector3(0, 1, 0));
                var info2 = ground.intersects(ray2);
            }
            camera.upperBetaLimit = Math.acos(BABYLON.Vector3.Dot(new Vector3(0, -1, 0), characterGround.subtract(info2.pickedPoint || camera.position).normalize()));
        }
    });
    engine.runRenderLoop(function () {
        scene.render();
    });
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
    window.addEventListener("keydown", handleKeyDown, false);
    window.addEventListener("keyup", handleKeyUp, false);
    function handleKeyDown(evt) {
        var tag = evt.target.tagName.toLowerCase();
        if (tag == 'input' || tag == 'textarea')
            return;
        if (evt.keyCode == 65) {
            keys.left = 1;
        }
        if (evt.keyCode == 68) {
            keys.right = 1;
        }
        if (evt.keyCode == 87) {
            keys.forward = 1;
        }
        if (evt.keyCode == 83) {
            keys.back = 1;
        }
    }
    function handleKeyUp(evt) {
        if (evt.keyCode == 65) {
            keys.left = 0;
        }
        if (evt.keyCode == 68) {
            keys.right = 0;
        }
        if (evt.keyCode == 87) {
            keys.forward = 0;
        }
        if (evt.keyCode == 83) {
            keys.back = 0;
        }
    }
};
//# sourceMappingURL=app.js.map