import { vec3 } from "gl-matrix";
import { Mesh } from "./Mesh.js";

export class ConeMesh extends Mesh {
    constructor(options){
        super(options);
        this.width = options.width || 6;
        this.height = options.height || 1; 
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
        const heightInterval = 1 / this.height;
        let r = 0.5;
        let tanAlphaSquared = (r * r) / (1 * 1);

        //Sides
        for(let i = 0; i < this.height + 1; i++){
            r = 0.5 - i * heightInterval * 0.5;
            for(let j = 0; j < this.width + 1; j++){
                const x = r * Math.cos(2 * Math.PI * j / this.width);
                const y = -0.5 + i * heightInterval;
                const z = r * Math.sin(2 * Math.PI * j / this.width);
                this.vertexCoordinates.push([x, y, z]);

                this.uvCoordinates.push([j * heightInterval, (i * heightInterval)]);

                let nx = 2 * x;
                let ny = 2 * y * tanAlphaSquared;
                let nz = 2 * z ;
                const normalVec = vec3.normalize(vec3.create(), vec3.fromValues(nx, ny, nz));
                this.normalCoordinates.push([normalVec[0], normalVec[1], normalVec[2]]);


            }
        }

        //Bot
        this.vertexCoordinates.push([0, -0.5, 0]);
        this.uvCoordinates.push([0.5, 0.5]);
        this.normalCoordinates.push([0, -1, 0]);
    }

    calculateTriangleVertices(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];

        //Sides
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
            
                //Top Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[j + (i * (this.width + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + (i * (this.width + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);

                this.uvs.push(this.uvCoordinates[j + (i * (this.width + 1))]);
                this.uvs.push(this.uvCoordinates[(j + 1) + (i * (this.width + 1))]);
                this.uvs.push(this.uvCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);

                this.normals.push(this.normalCoordinates[j + (i * (this.width + 1))]);
                this.normals.push(this.normalCoordinates[(j + 1) + (i * (this.width + 1))]);
                this.normals.push(this.normalCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);

                //Bottom Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[j + ((i + 1) * (this.width + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[j + (i * (this.width + 1))]);

                this.uvs.push(this.uvCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);
                this.uvs.push(this.uvCoordinates[j + ((i + 1) * (this.width + 1))]);
                this.uvs.push(this.uvCoordinates[j + (i * (this.width + 1))]);

                this.normals.push(this.normalCoordinates[(j + 1) + ((i + 1) * (this.width + 1))]);
                this.normals.push(this.normalCoordinates[j + ((i + 1) * (this.width + 1))]);
                this.normals.push(this.normalCoordinates[j + (i * (this.width + 1))]);

            }
        }

        //Bot
        for(let i = 0; i < this.width; i++){
            this.triangleCoordinates.push(this.vertexCoordinates[this.vertexCoordinates.length - 1]);
            this.triangleCoordinates.push(this.vertexCoordinates[i]);
            this.triangleCoordinates.push(this.vertexCoordinates[i + 1]);

            this.uvs.push([0.5, 0.5]);
            this.uvs.push(this.uvCoordinates[i]);
            this.uvs.push(this.uvCoordinates[i + 1]);

            this.normals.push([0, -1, 0]);
            this.normals.push([0, -1, 0]);
            this.normals.push([0, -1, 0]);
        }

        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());
        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());
    }
}