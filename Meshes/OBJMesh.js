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


    calculateTriangleVertices(){
        this.triangleCoordinates = [];
        this.uvs = [];
        this.normals = [];

        for(let i = 0; i < this.faces.length; i++){
            const face = this.faces[i];
            if(face.length === 3){
                this.addTriangleFace(face);
            }
            else{
                this.addQuadFace(face);
            }
        }

        this.triangleVertices = new Float32Array(this.triangleCoordinates.flat());
        this.triangleUVs = new Float32Array(this.uvs.flat());
        this.triangleNormals = new Float32Array(this.normals.flat());
    }

    addTriangleFace(face){
            this.triangleCoordinates.push(this.vertexCoordinates[face[0][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[face[1][0]]);
            this.triangleCoordinates.push(this.vertexCoordinates[face[2][0]]);

            this.uvs.push(this.uvCoordinates[face[0][1]]);
            this.uvs.push(this.uvCoordinates[face[1][1]]);
            this.uvs.push(this.uvCoordinates[face[2][1]]);

            this.normals.push(this.normalCoordinates[face[0][2]]);
            this.normals.push(this.normalCoordinates[face[1][2]]);
            this.normals.push(this.normalCoordinates[face[2][2]]);
    }

    addQuadFace(face){
        this.addTriangleFace([face[0], face[1], face[2]]);
        this.addTriangleFace([face[0], face[2], face[3]]);
    }
}