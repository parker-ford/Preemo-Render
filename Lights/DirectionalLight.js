import { vec3 } from "gl-matrix";
import { LineGizmoMesh } from "../Meshes/Gizmos/LineGizmoMesh";
import { Light } from "./Light";

export class DirectionalLight extends Light {
    #mode = 0;
    constructor(options) {
        super(options);
        this.mesh = new LineGizmoMesh({wireframe: true});
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

    updateLightDir(){
        this.lightDir = vec3.fromValues(-this.transform.position[0], -this.transform.position[1], -this.transform.position[2]);
        if(this.lightDir[0] == 0 && this.lightDir[1] == 0 && this.lightDir[2] == 0){
            this.lightDir[1] = 1;
        }
        this.lightDir = vec3.normalize(this.lightDir, this.lightDir);
        this.transform.setUpVector(this.lightDir);
    }

    update(){
        super.update();
        this.updateLightDir();
    }

}