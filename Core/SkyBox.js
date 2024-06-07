import { SkyboxMaterial } from "../Materials/SkyBoxMaterial";
import { CubeMesh } from "../Meshes/CubeMesh";
import { Transform } from "../Core/Transform";

export class SkyBox {
    constructor(options){
        this.texture = options.texture;
        this.mesh = new CubeMesh({});
        this.material = new SkyboxMaterial({texture: this.texture});
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
        });
    }
}