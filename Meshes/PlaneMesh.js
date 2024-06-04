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

    calculateLineVertices(){
        let lines = [];
        let line_uvs = [];
        let line_normals = [];

        for(let i = 0; i < this.triangleCoordinates.length; i+=3){
            //Line 1
            lines.push(this.triangleCoordinates[i]);
            lines.push(this.triangleCoordinates[i+1]);

            line_uvs.push(this.uvs[i]);
            line_uvs.push(this.uvs[i+1]);

            line_normals.push(this.normals[i]);
            line_normals.push(this.normals[i+1]);

            //Line 2
            lines.push(this.triangleCoordinates[i + 1]);
            lines.push(this.triangleCoordinates[i + 2]);

            line_uvs.push(this.uvs[i + 1]);
            line_uvs.push(this.uvs[i + 2]);

            line_normals.push(this.normals[i + 1]);
            line_normals.push(this.normals[i + 2]);

            //Line 3
            lines.push(this.triangleCoordinates[i + 2]);
            lines.push(this.triangleCoordinates[i]);

            line_uvs.push(this.uvs[i + 2]);
            line_uvs.push(this.uvs[i]);

            line_normals.push(this.normals[i + 2]);
            line_normals.push(this.normals[i]);
        }

        this.lineVertices = new Float32Array(lines.flat());
        this.lineUVs = new Float32Array(line_uvs.flat());
        this.lineNormals = new Float32Array(line_normals.flat());

        // this.lineUVs = new Float32Array(
        //     Array(lines.length * 2).fill(1.0)
        // );
        // this.lineNormals = new Float32Array(
        //     Array(lines.length * 3).fill(1.0)
        // );
    }
}