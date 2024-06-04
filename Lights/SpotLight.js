import { Light } from "./Light";
import { ConeGizmoMesh } from "../Meshes/Gizmos/ConeGizmoMesh";
import { BasicMaterial } from "../Materials/BasicMaterial";

export class SpotLight extends Light {
    #mode = 2;
    constructor(options) {
        super(options);
        this.mesh = new ConeGizmoMesh({wireframe: true});
        this.material = new BasicMaterial({color: this.color});
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