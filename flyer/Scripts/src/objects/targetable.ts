import { TargetCamera } from "babylonjs"

export interface Targetable {
    setAsTarget(camera: TargetCamera);
}