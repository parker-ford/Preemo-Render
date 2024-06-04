import { Light } from "./Light";
import { Transform } from "../Transform";
import { SphereGizmoMesh } from "../Meshes/SphereGizmoMesh";
import { BasicMaterial } from "../Materials/BasicMaterial";
import { vec3 } from "gl-matrix";
import { CylinderMesh } from "../Meshes/CylinderMesh";

export class PointLight extends Light {
    constructor(options) {
        super();
        this.mode = 1;
        this.color = options.color || [1, 1, 1, 1];
        this.intensity = options.intensity || 1;
        this.mesh = new SphereGizmoMesh({wireframe: true});
        // this.mesh = new CylinderMesh({width: 6, height: 1, wireframe: true});
        this.material = new BasicMaterial({color: this.color});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
        this.transform = new Transform({});
        this.fallOff = options.fallOff || 1;
        this.setMaxDistance(options.maxDistance || 5);

    }

    setMaxDistance(distance){
        this.maxDistance = distance;
        this.mesh.distance = distance;
        this.updateGizmo();
    }

    updateGizmo(){
        this.mesh.updateGizmo();
        this.material.color = this.color;
        this.material.updateMaterialBuffers();
    }

    update(){
        this.transform.update();
    }
}