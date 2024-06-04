import { Light } from "./Light";
import { ConeGizmoMesh } from "../Meshes/ConeGizmoMesh";
import { BasicMaterial } from "../Materials/BasicMaterial";


export class SpotLight extends Light {
    constructor(options) {
        super(options);
        this.mode = 2;
        this.mesh = new ConeGizmoMesh({wireframe: true});
        this.material = new BasicMaterial({color: this.color});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }
}