import { Mesh } from './Mesh.js';

export class ConeGizmoMesh extends Mesh {
    constructor(options){
        super(options);
        this.distance = 1;
        this.radius = 0.25;
        this.wireframe = true;
        this.calculateVertices();
        this.setupVertexBuffer();
    }

    calculateVertices(){
        this.calculateVertexCoordinates();
        this.calculateTriangleVertices();
        this.calculateLineVertices();
    }

    updateGizmo(){
        this.calculateVertices();
        this.setupVertexBuffer();
    }

    calculateVertexCoordinates(){
        this.vertexCoordinates = [];
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([Math.cos(i * 8 * Math.PI / 180) * this.radius, Math.sin(i * 8 * Math.PI / 180) * this.radius, this.distance]);
        }
        this.vertexCoordinates.push([0, 0, 0]);
        this.vertexCoordinates.push([0,0,this.distance])
        
    }

    calculateTriangleVertices(){
        this.triangleVertices = new Float32Array();
        this.triangleUVs = new Float32Array();
        this.triangleNormals = new Float32Array();
    }

    calculateLineVertices(){
        let lines = [];
        for(let i = 0; i < 44; i++){
            lines.push(this.vertexCoordinates[i]);
            lines.push(this.vertexCoordinates[i + 1]);
        }
        lines.push(this.vertexCoordinates[44]);
        lines.push(this.vertexCoordinates[0]);

        lines.push(this.vertexCoordinates[45]);
        lines.push(this.vertexCoordinates[0]);

        lines.push(this.vertexCoordinates[45]);
        lines.push(this.vertexCoordinates[(44 * .25)]);

        lines.push(this.vertexCoordinates[45]);
        lines.push(this.vertexCoordinates[(44 * .5)]);

        lines.push(this.vertexCoordinates[45]);
        lines.push(this.vertexCoordinates[(44 * .75)]);

        lines.push(this.vertexCoordinates[45]);
        lines.push(this.vertexCoordinates[46]);

        this.lineVertices = new Float32Array(lines.flat());
        this.lineUVs = new Float32Array(
            Array(lines.length * 2).fill(1.0)
        );
        this.lineNormals = new Float32Array(
            Array(lines.length * 3).fill(1.0)
        );
    }
}