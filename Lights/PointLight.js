import { Light } from "./Light";
import { SphereGizmoMesh } from "../Meshes/SphereGizmoMesh";

export class PointLight extends Light {
    #mode = 1;
    constructor(options) {
        super(options);
        this.mesh = new SphereGizmoMesh({wireframe: true});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }

    get mode() {
        return this.#mode;
    }

    set mode(value) {
        this.#mode = value;
    }
}