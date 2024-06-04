import { Mesh } from "./Mesh.js";
export class CubeMesh extends Mesh {
    constructor(options){
        super(options);
        this.width = options.width || 1;
        this.height = options.height || 1;
        this.depth = options.depth || 1; 
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
        const depthInterval = 1 / this.depth;
        
        //Front Face
        for(let i = 0; i < this.width + 1; i++){
            for(let j = 0; j < this.height + 1; j++){
                this.vertexCoordinates.push([ -0.5 + i * widthInterval, -0.5 + j * heightInterval, -0.5]);
                this.uvCoordinates.push([i * widthInterval, j * heightInterval]);
                this.normalCoordinates.push([0, 0, -1]);
            }
        }

        //Back Face
        for(let i = this.width; i >= 0; i--){
            for(let j = 0; j < this.height + 1; j++){
                this.vertexCoordinates.push([ -0.5 + i * widthInterval, -0.5 + j * heightInterval, 0.5]);
                this.uvCoordinates.push([1 - (i * widthInterval), j * heightInterval]);
                this.normalCoordinates.push([0, 0, 1]);
            }
        }
        
        //Right Face
        for(let i = 0; i < this.height + 1; i++){
            for(let j = 0; j < this.depth + 1; j++){
                this.vertexCoordinates.push([ 0.5, -0.5 + i * heightInterval, -0.5 + j * depthInterval]);
                this.uvCoordinates.push([ j * heightInterval, i * widthInterval]);
                this.normalCoordinates.push([1, 0, 0]);
            }
        }
        
        //Left Face
        for(let i = this.height; i >= 0; i--){
            for(let j = 0; j < this.depth + 1; j++){
                this.vertexCoordinates.push([ -0.5, -0.5 + i * heightInterval, -0.5 + j * depthInterval]);
                this.uvCoordinates.push([1 - (j * heightInterval), i * widthInterval]);
                this.normalCoordinates.push([-1, 0, 0]);
            }
        }
        
        //Top Face
        for(let i = 0; i < this.width + 1; i++){
            for(let j = 0; j < this.depth + 1; j++){
                this.vertexCoordinates.push([ -0.5 + i * widthInterval, 0.5, -0.5 + j * depthInterval]);
                this.uvCoordinates.push([i * widthInterval, j * heightInterval]);
                this.normalCoordinates.push([0, 1, 0]);
            }
        }

        //Bottom Face
        for(let i = this.width; i >= 0; i--){
            for(let j = 0; j < this.depth + 1; j++){
                this.vertexCoordinates.push([ -0.5 + i * widthInterval, -0.5, -0.5 + j * depthInterval]);
                this.uvCoordinates.push([i * widthInterval, 1 - (j * heightInterval)]);
                this.normalCoordinates.push([0, -1, 0]);
            }
        }


        
    }

    calculateFaceVertices(x, y, offset){
        for(let i = 0; i < x; i++){
            for(let j = 0; j < y; j++){
            
                //Top Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[(j + (i * (y + 1)) + offset)]);
                this.triangleCoordinates.push(this.vertexCoordinates[((j + 1) + (i * (y + 1))) + offset]);
                this.triangleCoordinates.push(this.vertexCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);

                this.uvs.push(this.uvCoordinates[(j + (i * (y + 1)) + offset)]);
                this.uvs.push(this.uvCoordinates[((j + 1) + (i * (y + 1))) + offset]);
                this.uvs.push(this.uvCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);

                this.normals.push(this.normalCoordinates[(j + (i * (y + 1)) + offset)]);
                this.normals.push(this.normalCoordinates[((j + 1) + (i * (y + 1))) + offset]);
                this.normals.push(this.normalCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);

                //Bottom Triangle
                this.triangleCoordinates.push(this.vertexCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + ((i + 1) * (y + 1))) + offset ]);
                this.triangleCoordinates.push(this.vertexCoordinates[(j + (i * (y + 1))) + offset]);

                this.uvs.push(this.uvCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);
                this.uvs.push(this.uvCoordinates[(j + ((i + 1) * (y + 1))) + offset]);
                this.uvs.push(this.uvCoordinates[(j + (i * (y + 1))) + offset]);

                this.normals.push(this.normalCoordinates[((j + 1) + ((i + 1) * (y + 1))) + offset]);
                this.normals.push(this.normalCoordinates[(j + ((i + 1) * (y + 1))) + offset]);
                this.normals.push(this.normalCoordinates[(j + (i * (y + 1))) + offset]);

            }
        }
    }

    calculateTriangleVertices(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];

        let offset = 0;

        //Front Face
        this.calculateFaceVertices(this.width, this.height, offset);
        offset += (this.width + 1) * (this.height + 1);

        //Back Face
        this.calculateFaceVertices(this.width, this.height, offset);
        offset += (this.width + 1) * (this.height + 1);

        //Right Face
        this.calculateFaceVertices(this.height, this.depth, offset);
        offset += (this.height + 1) * (this.depth + 1);

        //Left Face
        this.calculateFaceVertices(this.height, this.depth, offset);
        offset += (this.height + 1) * (this.depth + 1);

        //Top Face
        this.calculateFaceVertices(this.width, this.depth, offset);
        offset += (this.width + 1) * (this.depth + 1);

        //Bottom Face
        this.calculateFaceVertices(this.width, this.depth,offset);



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
    }
}