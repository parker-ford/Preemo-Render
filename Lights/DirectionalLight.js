import { vec3 } from "gl-matrix";
import { CylinderMesh } from "../Meshes/CylinderMesh";
import { BasicMaterial } from "../Materials/BasicMaterial";
import { Light } from "./Light";
import { Transform } from "../Transform";

export class DirectionalLight extends Light {
    constructor(options) {
        super();
        this.mode = 0;
        this.transform = new Transform({});
        this.transform.scale = vec3.fromValues(0.01, 0.75, 0.01);
        this.mesh = new CylinderMesh({width: 6, height: 1, wireframe: true});
        this.color = options.color || [1, 1, 1, 1];
        this.material = new BasicMaterial({color: this.color});
        this.lightDir = vec3.fromValues(0,0,0);
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
        this.intensity = options.intensity || 1;
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