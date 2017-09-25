import { Game } from './game';
import { DefaultWorld } from './worlds/default-world';

window.addEventListener('DOMContentLoaded', () => {
    BABYLON.Engine.ShadersRepository = "Assets/shader/";
    let game = new Game('renderCanvas');
    game.createScene();
    game.animate();

    let world = new DefaultWorld(game.getScene(), game.getLight());

    world.create();
});