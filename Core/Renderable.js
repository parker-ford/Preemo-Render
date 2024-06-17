import {Mesh} from '../Meshes/Mesh.js';
import {Material} from '../Materials/Material.js';
import {Transform} from './Transform.js';
import { ShadowTypes } from '../Shadows/ShadowTypes.js';
import { ProjectionShadow } from '../Shadows/ProjectionShadow.js';

export class Renderable{
    constructor(options){
        if (!(options.mesh instanceof Mesh)) {
            throw new Error('Renderable must be constructed with an instance of Mesh');
        }
        this.mesh = options.mesh;

        if (!(options.material instanceof Material)) {
            throw new Error('Renderable must be constructed with an instance of Material');
        }
        this.material = options.material;
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });

        this.transform = new Transform({});

        this.shadowType = ShadowTypes.None;
        this.projectionShadowObject = null;
    }

    useProjectionShadows(lightPosition){
        this.shadowType = ShadowTypes.Projection;
        this.projectionShadowObject = new ProjectionShadow({vertexBufferDescriptors: this.mesh.vertexBufferDescriptors, lightPosition: lightPosition});
    }

    changeMaterial(newMaterial){
        this.material = newMaterial;
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }

    changeWireframe(useWireframe){
        this.mesh.wireframe = useWireframe;
        this.mesh.setupVertexBuffer();
        this.material.init({
            vertexBufferDescriptors: this.mesh.vertexBufferDescriptors,
            wireframe: this.mesh.wireframe
        });
    }

    update(){
        this.transform.update();
        if(this.shadowType === ShadowTypes.Projection){
            this.projectionShadowObject.updateUniformBuffer();
        }
    }
}