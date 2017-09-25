var Vector3 = BABYLON.Vector3;
var SceneLoader = BABYLON.SceneLoader;
var runHorse = function () {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
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
        shadowGenerator.getShadowMap().renderList.push(character);
    });
    var tree;
    SceneLoader.ImportMesh("Plane.041", "Assets/", "testbaum.babylon", scene, function (meshes, p, s) {
        tree = meshes[0];
        tree.ellipsoid = new BABYLON.Vector3(1, 1.0, 1);
        tree.checkCollisions = true;
        tree.position = new Vector3(50, 32.5, 0);
        heightMapCollision(tree);
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
