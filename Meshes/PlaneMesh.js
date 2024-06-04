import { Mesh } from "./Mesh.js";
export class PlaneMesh extends Mesh {
    constructor(options){
        super(options);
        this.width = options.width || 1;
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
        const widthInterval = 1 / this.width;
        const heightInterval = 1 / this.height;
        for(let i = 0; i < this.width + 1; i++){
            for(let j = 0; j < this.height + 1; j++){
                this.vertexCoordinates.push([ -0.5 + i * widthInterval, -0.5 + j * heightInterval, 0]);
                this.uvCoordinates.push([i * widthInterval, j * heightInterval]);
                this.normalCoordinates.push([0, 0, 1]);
            }
        }
    }

    calculateTriangleVertices(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];

        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
            
                //Top Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[j + (i * (this.height + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + (i * (this.height + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);
                
                this.uvs.push(this.uvCoordinates[j + (i * (this.height + 1))]);
                this.uvs.push(this.uvCoordinates[(j + 1) + (i * (this.height + 1))]);
                this.uvs.push(this.uvCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);

                this.normals.push(this.normalCoordinates[j + (i * (this.height + 1))]);
                this.normals.push(this.normalCoordinates[(j + 1) + (i * (this.height + 1))]);
                this.normals.push(this.normalCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);


                //Bottom Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[j + ((i + 1) * (this.height + 1))]);
                this.triangleCoordinates.push(this.vertexCoordinates[j + (i * (this.height + 1))]);

                this.uvs.push(this.uvCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);
                this.uvs.push(this.uvCoordinates[j + ((i + 1) * (this.height + 1))]);
                this.uvs.push(this.uvCoordinates[j + (i * (this.height + 1))]);

                this.normals.push(this.normalCoordinates[(j + 1) + ((i + 1) * (this.height + 1))]);
                this.normals.push(this.normalCoordinates[j + ((i + 1) * (this.height + 1))]);
                this.normals.push(this.normalCoordinates[j + (i * (this.height + 1))]);

            }
        }

        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());
        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());

    }
}