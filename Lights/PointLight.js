import { Light } from "./Light";
import { SphereGizmoMesh } from "../Meshes/SphereGizmoMesh";

export class PointLight extends Light {
    constructor(options) {
        super(options);
        this.mode = 1;
        this.mesh = new SphereGizmoMesh({wireframe: true});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }
}