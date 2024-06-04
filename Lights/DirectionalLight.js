import { vec3 } from "gl-matrix";
import { CylinderMesh } from "../Meshes/CylinderMesh";
import { LineGizmoMesh } from "../Meshes/LineGizmoMesh";
import { BasicMaterial } from "../Materials/BasicMaterial";
import { Light } from "./Light";
import { Transform } from "../Transform";
import { SphereGizmoMesh } from "../Meshes/SphereGizmoMesh";

export class DirectionalLight extends Light {
    constructor(options) {
        super(options);
        this.mode = 0;;
        this.mesh = new CylinderMesh({width: 6, height: 1, wireframe: true});
        // this.mesh = new SphereGizmoMesh({width: 6, height: 1, wireframe: true});
        this.mesh = new LineGizmoMesh({wireframe: true});
        this.material = new BasicMaterial({color: this.color});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }

    updateLightDir(){
        this.lightDir = vec3.fromValues(-this.transform.position[0], -this.transform.position[1], -this.transform.position[2]);
        if(this.lightDir[0] == 0 && this.lightDir[1] == 0 && this.lightDir[2] == 0){
            this.lightDir[1] = 1;
        }
        this.lightDir = vec3.normalize(this.lightDir, this.lightDir);
        this.transform.setUpVector(this.lightDir);
    }

    updateGizmo(){
        this.material.color = this.color;
        this.material.updateMaterialBuffers();
    }


    update(){
        this.updateLightDir();
        this.transform.update();
    }

}