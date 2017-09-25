import {CollisionObjects} from "../collisionobjects"

export interface Obstacle {
    addToCollisionCollection(collisions:CollisionObjects);
}