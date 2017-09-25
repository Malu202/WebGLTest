import {AbstractMesh} from "babylonjs"

export interface ReflectionSurface {
    addToDynamicTextures(mesh:AbstractMesh);
}

export interface Reflectionable {
    addToReflectionSurface(surface:ReflectionSurface);
}