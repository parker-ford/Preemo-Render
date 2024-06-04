import { vec3 } from "gl-matrix";
import { Mesh } from "./Mesh.js";
export class TorusMesh extends Mesh {
    constructor(options){
        super(options);
        this.innerRadius = options.innerRadius || 0.25;

        this.ringSubdivisions = options.ringSubdivisions || 15;
        this.tubeSubdivisions = options.tubeSubdivisions || 15;

        this.calculateVertices();
        this.setupVertexBuffer();

    }

    calculateVertices(){
        this.calculateVertexCoordinates();
        this.calculateTriangleVertices();
        this.calculateLineVertices();
    }
    

    calculateVertexCoordinates(){
        this.vertexCoordinates = [];
        this.uvCoordinates = [];
        this.normalCoordinates = [];

        const outerRadius = 0.5;

        //Ring radius
        let phi = 0.0;
        const dp = (2 * Math.PI) / this.ringSubdivisions;

        //torus radius
        let theta = 0.0;
        const dt = (2 * Math.PI) / this.tubeSubdivisions
        for(let i = 0; i < this.tubeSubdivisions; i++){
            theta = dt * i;
            for(let j = 0; j < this.ringSubdivisions; j++){
                phi = dp * j;
                const x = Math.cos(theta) * (outerRadius + Math.cos(phi) * this.innerRadius);
                const z = Math.sin(theta) * (outerRadius + Math.cos(phi) * this.innerRadius);
                const y = Math.sin(phi) * this.innerRadius;
                this.vertexCoordinates.push([x, y, z]);

                this.uvCoordinates.push([ i / this.tubeSubdivisions, (j / this.ringSubdivisions + 0.5) % 1 ]);

                const nx = Math.cos(theta) * Math.cos(phi);
                const ny = Math.sin(phi);
                const nz = Math.sin(theta) * Math.cos(phi);

                const normalVec = vec3.normalize(vec3.create(), vec3.fromValues(nx, ny, nz));
                this.normalCoordinates.push([normalVec[0], normalVec[1], normalVec[2]]);
            }
        }

       
    }

    calculateTriangleVertices(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];

        for(let stack = 0; stack < this.tubeSubdivisions; stack++){
            for(let slice = 0; slice < this.ringSubdivisions; slice++){
    
                const t1 = stack * this.ringSubdivisions + slice;
                const t2 = ((stack + 1) % this.tubeSubdivisions) * this.ringSubdivisions + slice;
                const t3 = stack * this.ringSubdivisions + (slice + 1) % this.ringSubdivisions;
                const t4 = ((stack + 1) % this.tubeSubdivisions) * this.ringSubdivisions + (slice + 1) % this.ringSubdivisions;
    
                //Top Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[t1]);
                this.triangleCoordinates.push(this.vertexCoordinates[t3]);
                this.triangleCoordinates.push(this.vertexCoordinates[t4]);

                this.uvs.push(this.uvCoordinates[t1]);
                this.uvs.push(this.uvCoordinates[t3]);
                this.uvs.push(this.uvCoordinates[t4]);

                this.normals.push(this.normalCoordinates[t1]);
                this.normals.push(this.normalCoordinates[t3]);
                this.normals.push(this.normalCoordinates[t4]);
    
                //Bottom Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[t1]);
                this.triangleCoordinates.push(this.vertexCoordinates[t4]);
                this.triangleCoordinates.push(this.vertexCoordinates[t2]);

                this.uvs.push(this.uvCoordinates[t1]);
                this.uvs.push(this.uvCoordinates[t4]);
                this.uvs.push(this.uvCoordinates[t2]);

                this.normals.push(this.normalCoordinates[t1]);
                this.normals.push(this.normalCoordinates[t4]);
                this.normals.push(this.normalCoordinates[t2]);
            }
        }
    
        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());
        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());
    }
}