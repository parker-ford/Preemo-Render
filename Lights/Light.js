import { Transform } from "../Transform";
import { BasicMaterial } from "../Materials/BasicMaterial";

export class Light {
    constructor(options = {}) {
        this.color = options.color || [1, 1, 1, 1];
        this.intensity = options.intensity || 1;
        this.fallOff = options.fallOff || 0;
        this.maxDistance = options.maxDistance || 0;
        this.setMaxDistance(options.maxDistance || 5);
        this.umbra = options.umbra || 2 * Math.PI / 3;
        this.penumbra = options.penumbra || 0;
        this.setAngle(this.umbra);
        this.material = new BasicMaterial({color: this.color});
        this.transform = new Transform({});
    }

    setMaxDistance(distance){
        this.maxDistance = distance;
        if (this.mesh) {
            this.mesh.distance = distance;
            this.updateGizmo();
        }
    }

    setAngle(angle){
        this.umbra = angle;
        if (this.mesh) {
            this.mesh.radius = Math.tan(angle) * this.mesh.distance;
            this.updateGizmo();
        }
    }

    updateGizmo(){
        if (this.mesh && this.material) {
            this.mesh.updateGizmo();
            this.material.color = this.color;
            this.material.updateMaterialBuffers();
        }
    }

    update(){
        this.transform.update();
    }
}