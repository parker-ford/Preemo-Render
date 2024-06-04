import { vec3 } from "gl-matrix";
import { Mesh } from "./Mesh.js";
export class OBJMesh extends Mesh {
    constructor(options){
        super(options);
        this.filePath = options.filePath || "";
        this.loadedPromise = this.init();
        this.quadFace = false;
    }

    async init() {
        await this.calculateVertices();
        this.setupVertexBuffer();
    }

    loaded() {
        return this.loadedPromise;
    }

    async calculateVertices(){
        await this.calculateVertexCoordinates();
        this.calculateTriangleVertices();
        this.calculateLineVertices();
    }

    async calculateVertexCoordinates() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();

            this.vertexCoordinates = [];
            this.uvCoordinates = [];
            this.normalCoordinates = [];
            this.faces = [];

            const lines = data.split('\n');
            
            lines.forEach((line) => {
                const tokens = line.split(' ');
                if(tokens[0] === 'v'){
                    this.vertexCoordinates.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                }
                if(tokens[0] === 'vt'){
                    this.uvCoordinates.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
                }
                if(tokens[0] === 'vn'){
                    this.normalCoordinates.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                }
                if(tokens[0] === 'f'){
                    const face = [];
                    for(let i = 1; i < tokens.length; i++){
                        const faceTokens = tokens[i].split('/');
                        face.push([parseInt(faceTokens[0]) - 1, parseInt(faceTokens[1]) - 1, parseInt(faceTokens[2]) - 1]);
                    }
                    this.faces.push(face);
                }
            });

            if(this.faces[0].length === 3){
                this.quadFace = false;
            }
            else{
                this.quadFace = true;
            }


        } catch (e) {
            console.log('There has been a problem with your fetch operation: ' + e.message);
        }
    }

    calculateTriangleVerticesQuadFace(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];


        for(let i = 0; i < this.faces.length; i++){
        
            //Top Triangle
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][0][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][1][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][2][0]]);

            this.uvs.push(this.uvCoordinates[this.faces[i][0][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][1][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][2][1]]);

            this.normals.push(this.normalCoordinates[this.faces[i][0][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][1][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][2][2]]);

            //Bottom Triangle
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][0][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][3][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][2][0]]);

            this.uvs.push(this.uvCoordinates[this.faces[i][0][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][3][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][2][1]]);

            this.normals.push(this.normalCoordinates[this.faces[i][0][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][3][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][2][2]]);

        }

        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());

        this.triangleColors = new Float32Array(
            Array(this.triangleVertices.length).fill(1.0)
        );


        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());
    }

    calculateTriangleVerticesTriangleFace(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];


        for(let i = 0; i < this.faces.length; i++){

            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][0][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][1][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[this.faces[i][2][0]]);

            this.uvs.push(this.uvCoordinates[this.faces[i][0][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][1][1]]);
            this.uvs.push(this.uvCoordinates[this.faces[i][2][1]]);

            this.normals.push(this.normalCoordinates[this.faces[i][0][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][1][2]]);
            this.normals.push(this.normalCoordinates[this.faces[i][2][2]]);


        }

        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());
        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());
    }

    

    calculateTriangleVertices(){
        if(this.quadFace){
            this.calculateTriangleVerticesQuadFace();
        }
        else{
            this.calculateTriangleVerticesTriangleFace();
        }

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

        // console.log(lines.flat().length);
        // console.log(line_uvs.flat().length);
        // console.log(line_normals.flat().length);
        // console.log(lines.flat().length + line_uvs.flat().length + line_normals.flat().length)

    }
}