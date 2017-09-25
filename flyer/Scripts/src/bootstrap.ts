import {Game} from './game';

window.addEventListener('DOMContentLoaded', () => {
    BABYLON.Engine.ShadersRepository = "Assets/shader/";
    let game = new Game('renderCanvas');
    game.createScene();
    game.animate();
});